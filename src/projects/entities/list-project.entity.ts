import { PaginateEntity } from 'src/common/entities/paginate.entity';
import { ProjectEntity } from './project.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectPaginateEntity implements PaginateEntity<ProjectEntity> {
  @ApiProperty()
  total: number;
  @ApiProperty({
    isArray: true,
    type: ProjectEntity,
  })
  items: ProjectEntity[];
}
