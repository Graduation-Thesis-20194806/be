import { ApiHideProperty, ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateReportDto, CreateReportImageDto } from './create-report.dto';
import { IsOptional } from 'class-validator';
import { ReportStatus } from '@prisma/client';

export class UpdateReportDto extends PartialType(CreateReportDto) {
  @IsOptional()
  @ApiProperty({
    required: false,
    type: CreateReportImageDto,
    isArray: true,
  })
  newImages?: CreateReportImageDto[];

  @IsOptional()
  @ApiProperty({
    required: false,
    isArray: true,
    type: Number,
  })
  deleteImages?: number[];

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  status?: ReportStatus;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  phaseId?: number;

  @ApiHideProperty()
  @IsOptional()
  isProcessing?: boolean;
}
