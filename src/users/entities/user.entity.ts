import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { RoleEntity } from './role.entity';

export class UserCompactEntity {
  @ApiProperty({
    required: false,
  })
  avatar: string;

  @ApiProperty()
  username: string;
}
export class UserEntity {
  @ApiProperty()
  id: number;
  @ApiProperty()
  email: string;
  @ApiProperty()
  fullname: string;
  @ApiProperty({
    required: false,
  })
  avatar: string;
  @ApiProperty({
    required: false,
  })
  address: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty({
    required: false,
  })
  updatedAt: Date;
  @ApiProperty({
    type: RoleEntity,
    required: false,
  })
  role: RoleEntity;
  @ApiProperty()
  phoneNumber: string;
  @ApiProperty()
  username: string;

  @ApiHideProperty()
  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
