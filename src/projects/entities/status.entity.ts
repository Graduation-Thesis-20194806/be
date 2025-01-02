import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatusCategory } from '@prisma/client';

export class StatusEntity {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  color?: string;
  @ApiPropertyOptional({
    enum: TaskStatusCategory,
  })
  category?: boolean;
}
