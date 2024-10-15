import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PaginateDto } from 'src/common/dto/paginate.dto';

export class ReportQueryDto extends PaginateDto {
  @IsNotEmpty()
  @ApiProperty()
  role: 'assigned' | 'owner';
}
