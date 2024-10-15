import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
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
}
