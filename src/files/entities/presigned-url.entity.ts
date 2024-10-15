import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlEntity {
  @ApiProperty()
  url: string;
}
