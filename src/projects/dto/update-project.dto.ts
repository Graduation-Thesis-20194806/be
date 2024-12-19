import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { Optional } from '@nestjs/common';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @Optional()
  @ApiProperty()
  githubId?: number;
}
