import { ApiProperty } from '@nestjs/swagger';
import { PaginateEntity } from 'src/common/entities/paginate.entity';
import { NotificationEntity } from './notifications.entity';

export class NotificationPaginateEntity
  implements PaginateEntity<NotificationEntity>
{
  @ApiProperty()
  total: number;
  @ApiProperty({
    isArray: true,
    type: NotificationEntity,
  })
  items: NotificationEntity[];
}
