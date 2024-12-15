import { ApiProperty } from '@nestjs/swagger';
import { Priority } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

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
    type: Number,
  })
  attachments?: number[];

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  reportId?: number;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  phaseId?: number;
}
