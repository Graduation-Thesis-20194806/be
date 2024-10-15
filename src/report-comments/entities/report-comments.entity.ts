import { ApiProperty } from '@nestjs/swagger';
class CreateByEntity {
  @ApiProperty()
  username: string;
  @ApiProperty({
    required: false,
  })
  avatar?: string;
}
export class ReportCommentsEntity {
  @ApiProperty({
    type: CreateByEntity,
  })
  createdBy: CreateByEntity;
  @ApiProperty()
  id: number;
  @ApiProperty()
  createdById: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  content: string;
  @ApiProperty()
  reportId: number;
  constructor(partial: Partial<ReportCommentsEntity>) {
    Object.assign(this, partial);
  }
}
