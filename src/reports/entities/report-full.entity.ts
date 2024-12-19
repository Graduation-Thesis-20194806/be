import { ReportListItemEntity } from './report.entity';
import { ReportCommentsEntity } from 'src/report-comments/entities/report-comments.entity';
import { ApiProperty } from '@nestjs/swagger';
import { DuplicateLevel } from '@prisma/client';
import { TaskCompactEntity } from 'src/tasks/entities/task-full.entity';

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

export class ReportCompactEntity {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
}

export class ReportDuplicateEntity extends ReportCompactEntity {
  @ApiProperty({
    enum: DuplicateLevel,
  })
  level: DuplicateLevel;
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

  @ApiProperty({
    isArray: true,
    type: ReportDuplicateEntity,
    required: false,
  })
  DuplicateGroup?: ReportDuplicateEntity[];

  @ApiProperty({
    isArray: true,
    type: ReportCompactEntity,
    required: false,
  })
  children?: ReportCompactEntity[];

  @ApiProperty({
    isArray: true,
    type: TaskCompactEntity,
    required: false,
  })
  Task?: TaskCompactEntity[];

  constructor(partial: Partial<ReportFullEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}
