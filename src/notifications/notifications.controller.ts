import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { LoggedUserRequest } from 'src/auth/entities/logged-user.entity';
import { NotificationPaginateEntity } from './entities/list-notifications.entity';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Retrieve a list of notifications (filter by projectId & paginate)',
  })
  @ApiResponse({
    type: NotificationPaginateEntity,
  })
  async findAll(
    @Request() { user }: LoggedUserRequest,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationsService.findAll(+user.id, query);
  }

  @Patch(':id')
  async updateNotification(
    @Param('id') id: string,
    @Body() data: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(+id, data);
  }
}
