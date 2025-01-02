import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  isSeen: boolean;
}
