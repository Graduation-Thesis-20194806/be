import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';

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

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }
  findOne(id: number) {
    return this.prismaService.user.findFirst({
      where: {
        id: id,
      },
    });
  }
}
