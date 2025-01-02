import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginateDto } from 'src/common/dto/paginate.dto';

export class GithubRepoQueryDto extends PaginateDto {
  @IsOptional()
  @ApiProperty({
    required: false,
    type: String,
  })
  org?: string;
}
