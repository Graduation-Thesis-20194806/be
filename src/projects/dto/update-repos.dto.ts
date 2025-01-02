import { ApiProperty } from '@nestjs/swagger';
import { CreateGithubRepoDto } from './create-github-repo.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateReposDto {
  @ApiProperty({
    isArray: true,
    type: CreateGithubRepoDto,
  })
  @IsNotEmpty()
  repos: CreateGithubRepoDto[];
}
