import { ApiProperty } from '@nestjs/swagger';

export class ProjectDomainEntity {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;
}
