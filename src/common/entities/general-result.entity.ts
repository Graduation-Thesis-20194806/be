import { ApiProperty } from '@nestjs/swagger';

export class GeneralResult {
  @ApiProperty()
  success: boolean;
  @ApiProperty({ required: false })
  message?: string;

  constructor(partial: Partial<GeneralResult>) {
    Object.assign(this, partial);
  }
}
