import { ApiProperty } from '@nestjs/swagger';
import { Priority, TaskType } from '@prisma/client';
import { ProjectMemberEntity } from 'src/projects/entities/project.entity';

export class IssueGithubEntity {
  @ApiProperty()
  url: string;
}
export class TaskListItemEntity {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdBy: number;

  @ApiProperty({
    required: false,
  })
  estimateTime?: number; //minutes

  @ApiProperty({
    required: false,
    type: Date,
  })
  deadline?: Date;

  @ApiProperty({
    required: false,
    enum: Priority,
  })
  priority?: Priority;

  @ApiProperty({
    required: false,
  })
  isPublic?: boolean;

  @ApiProperty({
    required: false,
  })
  statusId?: number;

  @ApiProperty({
    required: false,
  })
  categoryId?: number;

  @ApiProperty({
    required: false,
    isArray: true,
    type: String,
  })
  references?: string[] = [];

  @ApiProperty({
    required: false,
  })
  assignedTo?: number;

  @ApiProperty({
    required: false,
    type: ProjectMemberEntity,
  })
  Assignee?: ProjectMemberEntity;

  @ApiProperty({
    type: ProjectMemberEntity,
  })
  ProjectMember: ProjectMemberEntity;

  @ApiProperty({
    required: false,
    isArray: true,
    type: Number,
  })
  tags?: number[] = [];

  @ApiProperty()
  Report: {
    name: string;
  };

  @ApiProperty()
  reportId: number;

  @ApiProperty({
    required: false,
  })
  phaseId?: number;

  @ApiProperty({
    required: false,
    enum: TaskType,
  })
  taskType?: TaskType;

  @ApiProperty({
    required: false,
    type: IssueGithubEntity,
  })
  IssueGithub: IssueGithubEntity;

  constructor(partial: Partial<TaskListItemEntity>) {
    Object.assign(this, partial);
  }
}
