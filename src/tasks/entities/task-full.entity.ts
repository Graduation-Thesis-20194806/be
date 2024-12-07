import { ApiProperty } from '@nestjs/swagger';
import { TaskListItemEntity } from './task.entity';
import { FileEntity } from 'src/files/entities/file.entity';
import { TaskCommentsEntity } from 'src/comments/entities/task-comments.entity';

export class TaskFullEntity extends TaskListItemEntity {
  @ApiProperty({
    isArray: true,
    type: FileEntity,
  })
  TaskAttachment: FileEntity[];
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
