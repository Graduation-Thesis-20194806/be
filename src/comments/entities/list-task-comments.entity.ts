import { PaginateEntity } from 'src/common/entities/paginate.entity';
import { TaskCommentsEntity } from './task-comments.entity';
import { ApiProperty } from '@nestjs/swagger';

export class TaskCommentPaginateEntity
  implements PaginateEntity<TaskCommentsEntity>
{
  @ApiProperty()
  total: number;

  @ApiProperty({
    isArray: true,
    type: TaskCommentsEntity,
  })
  items: TaskCommentsEntity[];
}
