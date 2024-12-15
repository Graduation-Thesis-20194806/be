import { ApiProperty } from '@nestjs/swagger';

export class FileEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  path: string;

  constructor(partial: Partial<FileEntity>) {
    Object.assign(this, partial);
  }
}
