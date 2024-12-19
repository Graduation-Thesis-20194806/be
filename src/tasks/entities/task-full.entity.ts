import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskListItemEntity } from './task.entity';
import { FileEntity } from 'src/files/entities/file.entity';
import { TaskCommentsEntity } from 'src/comments/entities/task-comments.entity';

export class TaskAttachmentEntity {
  @ApiProperty({
    type: FileEntity,
  })
  file: FileEntity;
}

export class TaskCompactEntity {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiPropertyOptional()
  status: string;
}
export class TaskFullEntity extends TaskListItemEntity {
  @ApiProperty({
    isArray: true,
    type: TaskAttachmentEntity,
  })
  TaskAttachment: TaskAttachmentEntity[];
  @ApiProperty({
    isArray: true,
    type: TaskCommentsEntity,
  })
  TaskComment: TaskCommentsEntity[];

  constructor(partial: Partial<TaskFullEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}
