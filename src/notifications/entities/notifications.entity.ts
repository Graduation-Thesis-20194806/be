import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export enum NotiAction {
  CREAT = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
export enum NotiEntity {
  REPORT = 'REPORT',
  TASK = 'TASK',
}
export class NotiFieldInformation {
  @ApiPropertyOptional()
  id?: number;
  @ApiProperty()
  name: number;
}

export class NotificationContent {
  @ApiProperty({
    type: NotiFieldInformation,
  })
  subject: NotiFieldInformation;
  @ApiProperty({
    enum: NotiAction,
  })
  action: NotiAction;
  @ApiProperty({
    enum: NotiEntity,
  })
  objectEntity: NotiEntity;

  @ApiProperty({
    type: NotiFieldInformation,
  })
  object: NotiFieldInformation;

  @ApiPropertyOptional()
  objectAttribute?: string;

  @ApiPropertyOptional({
    type: NotiFieldInformation,
  })
  objectAttributeValue?: string | NotiFieldInformation;
}

export class NotificationEntity {
  @ApiProperty()
  id: number;
  @ApiProperty({
    type: NotificationContent,
  })
  content: NotificationContent;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  projectId: number;
  @ApiProperty()
  userId: number;
  @ApiProperty()
  isSeen: boolean;
  @ApiProperty()
  ProjectMember: any;
  constructor(partial: Partial<NotificationEntity>) {
    Object.assign(this, partial);
  }
}
