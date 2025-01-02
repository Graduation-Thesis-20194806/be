import { DynamicModule, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  providers: [NotificationsService, NotificationsGateway],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {
  static forRoot(option: { isGlobal?: boolean } = {}): DynamicModule {
    return {
      global: option.isGlobal,
      module: NotificationsModule,
    };
  }
}
