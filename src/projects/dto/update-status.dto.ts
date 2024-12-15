import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProjectStatusDto } from './create-status.dto';

export class UpdateStatusDto extends PartialType(CreateProjectStatusDto) {
  @ApiPropertyOptional({
    description: 'The new name of the status',
    example: 'Completed',
  })
  name?: string;
}
