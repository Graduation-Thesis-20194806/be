import { ApiProperty } from '@nestjs/swagger';
import { Priority } from '@prisma/client';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  id?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  description?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  estimateTime?: number; //minutes

  @IsOptional()
  @ApiProperty({
    required: false,
    type: Date,
  })
  deadline?: Date;

  @IsOptional()
  @ApiProperty({
    required: false,
    enum: Priority,
  })
  priority?: Priority;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  isPublic?: boolean;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    required: false,
  })
  statusId?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    required: false,
  })
  categoryId?: number;

  @IsOptional()
  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  references?: string[] = [];

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    required: false,
  })
  assignedTo?: number;

  @IsOptional()
  @ApiProperty({
    required: false,
    isArray: true,
    type: Number,
  })
  tags?: number[] = [];

  @IsOptional()
  @ApiProperty({
    required: false,
    isArray: true,
  })
  newAttachments?: number[];

  @IsOptional()
  @ApiProperty({
    required: false,
    isArray: true,
  })
  deleteAttachments?: number[];
}
