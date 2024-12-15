import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectStatusDto {
  @ApiProperty({
    description: 'The name of the status',
    example: 'In Progress',
  })
  @IsNotEmpty()
  name: string;
}
