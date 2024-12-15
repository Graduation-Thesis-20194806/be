import { ApiProperty } from '@nestjs/swagger';

export class StatusEntity {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
}
