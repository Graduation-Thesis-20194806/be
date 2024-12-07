import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TaskCreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  content: string;
}
