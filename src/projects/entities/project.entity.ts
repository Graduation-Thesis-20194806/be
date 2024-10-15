import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';
class UserRoleEntity {
  @ApiProperty()
  name?: string;
  @ApiProperty({ enum: ProjectRole })
  category?: ProjectRole;
}
export class ProjectEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  projectThumbnail?: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: UserRoleEntity, required: false })
  userRole?: UserRoleEntity;

  constructor(partial: Partial<ProjectEntity>) {
    Object.assign(this, partial);
  }
}
