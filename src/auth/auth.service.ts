import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { memoizedMs } from 'src/common/helper/memoize';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { nanoid } from 'nanoid';
import { JwtPayloadEntity } from './entities/jwt-payload.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { LoginReturnEntity } from './entities/login-return.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private usersService: UsersService,
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
    const user = await this.usersService.findUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      delete user.password;
      return user;
    }
    return null;
  }

  async login(user: User): Promise<LoginReturnEntity> {
    const refreshToken = await nanoid();
    await this.prismaService.token.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiredAt: new Date(
          Date.now() +
            memoizedMs(
              this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
            ),
        ),
      },
    });
    const payload: JwtPayloadEntity = {
      sub: user.id,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: refreshToken,
      user: new UserEntity(user),
    };
  }
  async validateRefreshToken(token: string): Promise<User | undefined> {
    const refreshToken = await this.prismaService.token.findUnique({
      where: {
        token,
      },
    });

    if (!refreshToken) {
      return undefined;
    }

    const now = Date.now();
    const expiredAt = new Date(refreshToken.expiredAt).getTime();
    if (now > expiredAt) {
      await this.prismaService.token.delete({
        where: {
          id: refreshToken.id,
        },
      });
      return undefined;
    }
    return this.usersService.findOne(+refreshToken.userId);
  }

  async saveGithubInfo(user_id: number, userData: any, access_token: string) {
    return this.prismaService.user.update({
      where: { id: user_id },
      data: {
        githubId: userData.data.id.toString(),
        githubUsername: userData.data.login,
        githubAccessToken: access_token,
      },
    });
  }
  async deleteGithubInfo(user_id: number) {
    return this.prismaService.user.update({
      where: { id: user_id },
      data: {
        githubId: null,
        githubUsername: null,
        githubAccessToken: null,
      },
    });
  }
}
