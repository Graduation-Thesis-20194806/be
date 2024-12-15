import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePhaseDto {
  @ApiPropertyOptional({
    description: 'The name of the phase',
    example: 'Updated Phase Name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'A brief description of the phase',
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Start date/time of the phase',
    example: '2024-01-05T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'End date/time of the phase',
    example: '2024-02-10T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
