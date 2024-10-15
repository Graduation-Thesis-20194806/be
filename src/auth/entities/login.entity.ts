import { UserEntity } from 'src/users/entities/user.entity';
import { TokenEntity } from './token.entity';
import { ApiProperty } from '@nestjs/swagger';

export class LoginEntity extends TokenEntity {
  @ApiProperty({
    required: false,
    type: UserEntity,
  })
  user?: UserEntity;

  constructor(partial: Partial<TokenEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}
