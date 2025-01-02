import { ApiProperty } from '@nestjs/swagger';

export class CreateGithubRepoDto {
  @ApiProperty()
  githubId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  owner: string;
}
