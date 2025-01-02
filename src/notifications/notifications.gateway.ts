// notifications/notifications.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Notification } from '@prisma/client';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Extract userId from query params
    const userId = client.handshake.query.userId;
    if (userId) {
      const roomName = `user_${userId}`;
      client.join(roomName);
      console.log(`Client ${client.id} joined room: ${roomName}`);
    } else {
      console.log(`Client ${client.id} connected without userId`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  sendNotificationToUser(userId: number, notification: Notification) {
    const roomName = `user_${userId}`;
    this.server
      .to(roomName)
      .emit('notificationCreated', { projectId: notification.projectId });
  }
}
