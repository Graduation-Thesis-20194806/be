import { ApiProperty } from '@nestjs/swagger';

export class TokenEntity {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;

  constructor(partial: Partial<TokenEntity>) {
    Object.assign(this, partial);
  }
}
