import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';

export class RoleEntity {
  @ApiProperty()
  id: number;
  @ApiProperty({
    enum: ProjectRole,
  })
  category: ProjectRole;
  @ApiProperty()
  name: string;
  @ApiProperty()
  projectId: number;
}
