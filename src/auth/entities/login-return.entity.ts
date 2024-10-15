import { UserEntity } from 'src/users/entities/user.entity';
import { TokenEntity } from './token.entity';
import { ApiProperty } from '@nestjs/swagger';

export class LoginReturnEntity extends TokenEntity {
  @ApiProperty({
    type: UserEntity,
  })
  user: UserEntity;
}
