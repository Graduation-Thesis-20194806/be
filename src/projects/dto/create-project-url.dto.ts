import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDomainDto {
  @ApiProperty({ example: 'GitHub' })
  name: string;

  @ApiProperty({ example: 'https://github.com/example/project' })
  url: string;
}
