import { ApiProperty } from '@nestjs/swagger';
import {
  ReportIssueType,
  ReportStatus,
  ReportType,
  Severity,
} from '@prisma/client';
import { UserCompactEntity } from 'src/users/entities/user.entity';

export class ReportListItemEntity {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty({
    enum: ReportType,
  })
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
    enum: ReportIssueType,
  })
  issueType?: ReportIssueType;
  @ApiProperty({
    required: false,
    enum: Severity,
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
  @ApiProperty({
    enum: ReportStatus,
  })
  status: ReportStatus;
  @ApiProperty()
  url: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    required: false,
  })
  groupId: number;

  @ApiProperty({
    required: false,
    type: UserCompactEntity,
  })
  assignee?: UserCompactEntity;

  @ApiProperty({
    type: UserCompactEntity,
  })
  createdBy: UserCompactEntity;

  constructor(partial: Partial<ReportListItemEntity>) {
    Object.assign(this, partial);
  }
}
