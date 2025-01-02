import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { PaginateDto } from 'src/common/dto/paginate.dto';

export class NotificationQueryDto extends PaginateDto {
  @ApiPropertyOptional({
    description: 'Filter notifications by projectId',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  projectId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'false' ? false : value === 'true' ? true : undefined,
  )
  isSeen?: boolean;
}
