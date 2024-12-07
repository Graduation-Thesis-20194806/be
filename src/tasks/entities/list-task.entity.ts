import { PaginateEntity } from 'src/common/entities/paginate.entity';
import { ApiProperty } from '@nestjs/swagger';
import { TaskListItemEntity } from './task.entity';

export class TaskPaginationEntity
  implements PaginateEntity<TaskListItemEntity>
{
  @ApiProperty()
  total: number;

  @ApiProperty({ isArray: true, type: TaskListItemEntity })
  items: TaskListItemEntity[];
}
