import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class MergeReportDto {
  @IsNotEmpty()
  @ApiProperty()
  childrenId: number;

  @IsNotEmpty()
  @ApiProperty()
  type: 'delete' | 'merge';
}
