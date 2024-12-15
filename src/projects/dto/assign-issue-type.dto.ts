import { ApiProperty } from '@nestjs/swagger';
import { ReportIssueType } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class AssignIssueTypeDto {
  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ enum: ReportIssueType, example: ReportIssueType.UI })
  @IsNotEmpty()
  issueType: ReportIssueType;
}
