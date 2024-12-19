import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'The name of the category', example: 'Backend' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  color?: string;
}
