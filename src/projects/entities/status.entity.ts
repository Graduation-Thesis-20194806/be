import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StatusEntity {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  color?: string;
  @ApiPropertyOptional()
  isCloseStatus?: boolean;
}
