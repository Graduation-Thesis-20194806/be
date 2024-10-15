import { ApiProperty } from '@nestjs/swagger';
import {
  ReportIssueType,
  ReportStatus,
  ReportType,
  Severity,
} from '@prisma/client';

export class ReportListItemEntity {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  type: ReportType;
  @ApiProperty()
  description: string;
  @ApiProperty({
    required: false,
  })
  stepsToReproduce?: string;
  @ApiProperty({
    required: false,
  })
  expectedBehavior?: string;
  @ApiProperty({
    required: false,
  })
  actualResult?: string;
  @ApiProperty({
    required: false,
  })
  issueType?: ReportIssueType;
  @ApiProperty({
    required: false,
  })
  severity?: Severity;
  @ApiProperty({
    required: false,
  })
  assignedTo?: number;
  @ApiProperty()
  createdById: number;
  @ApiProperty()
  projectId: number;
  @ApiProperty()
  status: ReportStatus;
  @ApiProperty()
  url: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<ReportListItemEntity>) {
    Object.assign(this, partial);
  }
}
