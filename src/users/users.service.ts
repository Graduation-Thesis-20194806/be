import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const res = await this.prismaService.user.findUnique({
      where: {
        email: createUserDto.email,
      },
      select: {
        password: false,
        githubAccessToken: false,
      },
    });
    if (!res) {
      const salt = bcrypt.genSaltSync(
        Number(this.configService.get('SALT_ROUND')),
      );
      const password = bcrypt.hashSync(createUserDto.password, salt);
      const user = await this.prismaService.user.create({
        data: { ...createUserDto, password: password },
      });
      return user;
    }
    return null;
  }

  async findUserByEmail(email: string) {
    const res = await this.prismaService.user.findUnique({
      where: { email },
    });
    delete res.githubAccessToken;
    return res;
  }
  async findOne(id: number) {
    const res = await this.prismaService.user.findFirst({
      where: {
        id: id,
      },
    });
    if (res) {
      delete res.password;
      delete res.githubAccessToken;
    }
    return res;
  }

  async findOneReturnFull(id: number) {
    return this.prismaService.user.findFirst({
      where: {
        id: id,
      },
    });
  }

  async updateUser(id: number, data: UpdateUserDto) {
    return this.prismaService.user.update({
      where: {
        id,
      },
      data,
    });
  }
}
