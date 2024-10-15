import { ApiProperty } from '@nestjs/swagger';
import {
  ReportIssueType,
  ReportStatus,
  ReportType,
  Severity,
} from '@prisma/client';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReportImageDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  path: string;
}
export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  type?: ReportType = ReportType.BUG;

  @IsOptional()
  @ApiProperty()
  severity?: Severity;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  isPublic?: boolean = true;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    required: false,
  })
  assignedTo?: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  stepsToReproduce: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  expectedBehavior: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  actualResult: string;

  @IsOptional()
  @ApiProperty()
  issueType: ReportIssueType;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  additionInfo?: any = {};

  @IsNotEmpty()
  @ApiProperty()
  url: string;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  status?: ReportStatus = ReportStatus.INIT;

  @IsOptional()
  @ApiProperty({
    required: false,
    type: CreateReportImageDto,
    isArray: true,
  })
  images?: CreateReportImageDto[];

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  tags?: string[] = [];
}
