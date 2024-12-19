import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
  Res,
  Get,
  Query,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorator/public-guard.decorator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginEntity } from './entities/login.entity';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerResponse } from 'src/common/decorator/swagger-response.decorator';
import { LoginReturnEntity } from './entities/login-return.entity';
import { Response } from 'express';
import { Auth } from './decorator/auth.decorator';
import axios from 'axios';
import { LoggedUserRequest } from './entities/logged-user.entity';
import { Octokit } from '@octokit/rest';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}
  @Public()
  @Post('login')
  @ApiResponse({
    status: 200,
    type: LoginReturnEntity,
  })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.login(user);
  }
  @Public()
  @Post('register')
  @ApiResponse({
    status: 200,
    type: UserEntity,
  })
  async register(@Body() userData: CreateUserDto) {
    const res = await this.usersService.createUser(userData);
    if (!res) throw new BadRequestException();
    return new UserEntity(res);
  }
  @Public()
  @Post('refresh-token')
  @ApiResponse({
    status: 200,
    type: LoginEntity,
  })
  @SwaggerResponse(ApiInternalServerErrorResponse, {
    description: 'generate token exception',
  })
  @SwaggerResponse(ApiUnauthorizedResponse, {
    description: 'token is not valid',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginEntity> {
    console.log(refreshTokenDto.token);
    const user = await this.authService.validateRefreshToken(
      refreshTokenDto.token,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    const token = await this.authService.login(user);
    const ret: LoginEntity = {
      ...token,
    };
    ret.user = new UserEntity(user);
    return ret;
  }

  @Auth()
  @Get('github/login')
  async githubLogin(@Res() res: Response) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const callbackUrl = process.env.GITHUB_CALLBACK_URL;
    const scope = 'read:org,repo,user,project';
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      callbackUrl,
    )}&scope=${encodeURIComponent(scope)}`;
    return res.redirect(url);
  }

  @ApiResponse({
    status: 200,
  })
  @Get('github/callback')
  async githubCallback(
    @Request() { user }: LoggedUserRequest,
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    const client_id = process.env.GITHUB_CLIENT_ID;
    const client_secret = process.env.GITHUB_CLIENT_SECRET;

    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      { client_id, client_secret, code },
      { headers: { Accept: 'application/json' } },
    );

    const { access_token } = tokenRes.data;

    const octokit = new Octokit({ auth: access_token });
    const userData = await octokit.rest.users.getAuthenticated();

    await this.authService.saveGithubInfo(+user.id, userData, access_token);

    return res.send(200);
  }
}
