import { ApiProperty } from '@nestjs/swagger';
import { ProjectMemberEntity } from 'src/projects/entities/project.entity';
export class TaskCommentsEntity {
  @ApiProperty({
    type: ProjectMemberEntity,
  })
  projectMember: ProjectMemberEntity;
  @ApiProperty()
  id: number;
  @ApiProperty()
  createdBy: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  content: string;
  @ApiProperty()
  taskId: number;
  constructor(partial: Partial<TaskCommentsEntity>) {
    Object.assign(this, partial);
  }
}
