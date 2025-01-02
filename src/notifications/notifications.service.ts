// notifications/notifications.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationsGateway } from './notifications.gateway';
import { Prisma } from '@prisma/client';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(createNotificationDto: CreateNotificationDto, sendTo: number[]) {
    const newNotif = await this.prisma.notification.create({
      data: createNotificationDto,
    });
    Promise.all(
      sendTo.map((user) =>
        this.notificationsGateway.sendNotificationToUser(user, newNotif),
      ),
    );

    return newNotif;
  }

  async findAll(user_id: number, query: NotificationQueryDto) {
    const { projectId, page, pageSize, isSeen } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const where = { userId: user_id } as Prisma.NotificationWhereInput;
    if (projectId) {
      where.projectId = projectId;
    }
    if (isSeen !== undefined) {
      where.isSeen = isSeen;
    }

    const [results, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          ProjectMember: {
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.notification.count({
        where: {
          ...where,
          isSeen: false,
        },
      }),
    ]);
    return {
      items: results,
      total,
    };
  }

  async update(id: number, data: UpdateNotificationDto) {
    return this.prisma.notification.update({
      where: { id },
      data,
    });
  }
}
