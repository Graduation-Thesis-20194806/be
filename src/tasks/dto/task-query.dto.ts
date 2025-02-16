import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { PaginateDto } from 'src/common/dto/paginate.dto';

export class TaskQueryDto extends PaginateDto {
  @IsNotEmpty()
  @ApiProperty()
  role: 'all' | 'assigned' | 'owner';

  @IsOptional()
  @ApiProperty({
    required: false,
    type: String,
  })
  keyword?: string;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  categoryId?: number;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  statusId?: number;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  phaseId?: number;
}
