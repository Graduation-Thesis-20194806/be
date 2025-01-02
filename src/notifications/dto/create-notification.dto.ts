import { ApiProperty } from '@nestjs/swagger';
import { NotiAction, NotiEntity } from '../entities/notifications.entity';
type NotiFieldInformationType = {
  id?: number;
  name: string;
};

type NotificationContentType = {
  subject: NotiFieldInformationType;
  action: NotiAction;
  objectEntity: NotiEntity;
  object: NotiFieldInformationType;
  objectAttribute?: string;
  objectAttributeValue?: string | NotiFieldInformationType;
};
export class CreateNotificationDto {
  @ApiProperty({ example: 'Nội dung của thông báo' })
  content: NotificationContentType;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 1 })
  projectId: number;
}
