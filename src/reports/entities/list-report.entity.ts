import { PaginateEntity } from 'src/common/entities/paginate.entity';
import { ReportListItemEntity } from './report.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ReportPaginationEntity
  implements PaginateEntity<ReportListItemEntity>
{
  @ApiProperty()
  total: number;

  @ApiProperty({ isArray: true, type: ReportListItemEntity })
  items: ReportListItemEntity[];
}
