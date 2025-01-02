import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  address: string;

  @IsNotEmpty()
  @ApiProperty()
  fullname: string;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  avatar: string;
}
