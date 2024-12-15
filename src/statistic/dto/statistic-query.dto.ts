import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class StatisticQueryDto {
  @IsNotEmpty()
  @ApiProperty()
  role: 'all' | 'assigned' | 'owner';
  @ApiPropertyOptional({
    description: 'Start date/time of the phase',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'End date/time of the phase',
    example: '2024-02-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateType?: 'day' | 'month' | 'year' = 'day';
}
