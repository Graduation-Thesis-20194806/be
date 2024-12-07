import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  category: ProjectRole;
}
