import { ReportListItemEntity } from './report.entity';
import { ReportCommentsEntity } from 'src/report-comments/entities/report-comments.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ReportImageEntity {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  path: string;
  @ApiProperty()
  reportId: number;
}
export class ReportFullEntity extends ReportListItemEntity {
  @ApiProperty({
    isArray: true,
    type: ReportImageEntity,
  })
  ReportImage: ReportImageEntity[];
  @ApiProperty({
    isArray: true,
    type: ReportCommentsEntity,
  })
  ReportComment: ReportCommentsEntity[];
}
