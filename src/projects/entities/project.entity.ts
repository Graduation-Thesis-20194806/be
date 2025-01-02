import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';
import { UserCompactEntity } from 'src/users/entities/user.entity';

export class ProjectMemberEntity {
  @ApiProperty({
    type: UserCompactEntity,
  })
  user: UserCompactEntity;
}
export class GithubRepoEntity {
  @ApiPropertyOptional()
  id?: number;
  @ApiProperty()
  githubId: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  owner: string;
}
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

  @ApiPropertyOptional()
  githubOrgName?: string;

  @ApiPropertyOptional({ type: GithubRepoEntity, isArray: true })
  GithubRepo?: GithubRepoEntity[];

  constructor(partial: Partial<ProjectEntity>) {
    Object.assign(this, partial);
  }
}
