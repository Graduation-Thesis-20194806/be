import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProjectStatusDto } from './create-status.dto';
import { IsOptional } from 'class-validator';

export class UpdateStatusDto extends PartialType(CreateProjectStatusDto) {
  @ApiPropertyOptional({
    description: 'The new name of the status',
    example: 'Completed',
  })
  name?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  color?: string;
}
