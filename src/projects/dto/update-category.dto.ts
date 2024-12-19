import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional({
    description: 'The new name of the category',
    example: 'Frontend',
  })
  name?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  color?: string;
}
