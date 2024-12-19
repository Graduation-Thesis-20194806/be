import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginateDto } from 'src/common/dto/paginate.dto';

export class ProjectQueryDto extends PaginateDto {
  @IsOptional()
  @ApiProperty({
    required: false,
    type: String,
  })
  keyword?: string;
}
