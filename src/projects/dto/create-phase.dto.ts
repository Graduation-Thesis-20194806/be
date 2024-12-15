import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePhaseDto {
  @ApiProperty({
    description: 'The name of the phase',
    example: 'Design Phase',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'A brief description of the phase',
    example: 'Initial design and planning',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Start date/time of the phase',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  from: string;

  @ApiProperty({
    description: 'End date/time of the phase',
    example: '2024-02-01T00:00:00.000Z',
  })
  @IsDateString()
  to: string;
}
