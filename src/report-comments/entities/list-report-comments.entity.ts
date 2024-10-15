import { PaginateEntity } from 'src/common/entities/paginate.entity';
import { ReportCommentsEntity } from './report-comments.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ReportCommentPaginateEntity
  implements PaginateEntity<ReportCommentsEntity>
{
  @ApiProperty()
  total: number;

  @ApiProperty({
    isArray: true,
    type: ReportCommentsEntity,
  })
  items: ReportCommentsEntity[];
}
