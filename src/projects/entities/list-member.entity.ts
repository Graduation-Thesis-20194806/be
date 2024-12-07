import { ApiProperty } from '@nestjs/swagger';
import { PaginateEntity } from 'src/common/entities/paginate.entity';
import { UserEntity } from 'src/users/entities/user.entity';

export class MemberPaginateEntity implements PaginateEntity<UserEntity> {
  @ApiProperty()
  total: number;
  @ApiProperty({
    isArray: true,
    type: UserEntity,
  })
  items: UserEntity[];
}
