import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiPropertyOptional()
  githubId?: string;

  @ApiPropertyOptional()
  githubUsername?: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
