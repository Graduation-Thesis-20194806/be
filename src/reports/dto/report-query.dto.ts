import { ApiProperty } from '@nestjs/swagger';
import { ReportIssueType, ReportStatus, Severity } from '@prisma/client';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { PaginateDto } from 'src/common/dto/paginate.dto';

export class ReportQueryDto extends PaginateDto {
  @IsNotEmpty()
  @ApiProperty()
  role: 'all' | 'assigned' | 'owner';

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  groupId?: number;

  @IsOptional()
  @ApiProperty({
    required: false,
    enum: Severity,
  })
  severity?: Severity;

  @IsOptional()
  @ApiProperty({
    required: false,
    enum: ReportIssueType,
  })
  issueType?: ReportIssueType;

  @IsOptional()
  @ApiProperty({
    required: false,
    enum: ReportStatus,
  })
  status?: ReportStatus;

  @IsOptional()
  @ApiProperty({
    required: false,
    type: String,
  })
  keyword?: string;
}
