import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  private logger = new Logger(TasksService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createTask(
    user_id: number,
    projectid: number,
    taskData: CreateTaskDto,
  ) {
    const { attachments, ...createTaskDto } = taskData;
    const task = await this.prismaService.task.create({
      data: {
        projectId: projectid,
        createdBy: user_id,
        ...createTaskDto,
      } as any,
      include: {
        TaskAttachment: true,
        TaskComment: {
          include: {
            projectMember: {
              include: {
                user: {
                  select: {
                    avatar: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (attachments?.length) {
      const taskAttachments =
        await this.prismaService.taskAttachment.createManyAndReturn({
          data: attachments.map((item) => ({ fileId: item, taskId: task.id })),
        });
      task.TaskAttachment = taskAttachments;
    }
    return task;
  }
  async updateTask(
    user_id: number,
    projectid: number,
    task_id: number,
    taskData: UpdateTaskDto,
  ) {
    const { newAttachments, deleteAttachments, ...updateTaskDto } = taskData;
    if (deleteAttachments?.length) {
      await this.prismaService.taskAttachment.deleteMany({
        where: {
          id: {
            in: deleteAttachments,
          },
        },
      });
    }
    const task = await this.prismaService.task.update({
      where: {
        id: task_id,
        projectId: projectid,
        createdBy: user_id,
      },
      data: {
        ...updateTaskDto,
      } as any,
      include: {
        TaskAttachment: true,
        TaskComment: {
          include: {
            projectMember: {
              include: {
                user: {
                  select: {
                    avatar: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!task) return;
    if (newAttachments?.length) {
      const taskAttachments =
        await this.prismaService.taskAttachment.createManyAndReturn({
          data: newAttachments.map((item) => ({
            fileId: item,
            taskId: task.id,
          })),
        });
      task.TaskAttachment.push(...taskAttachments);
    }
    return task;
  }

  async findMany(
    user_id: number,
    projectId: number,
    taskQueryDto: TaskQueryDto,
  ) {
    const { page, pageSize, role, keyword } = taskQueryDto;
    const where: Prisma.TaskWhereInput = { projectId };
    if (role === 'owner') where.createdBy = user_id;
    else if (role === 'assigned') where.assignedTo = user_id;
    if (keyword) {
      where.OR = [
        {
          name: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
      ];
    }
    const [total, items] = await this.prismaService.$transaction([
      this.prismaService.task.count({
        where,
      }),
      this.prismaService.task.findMany({
        where,
        skip: pageSize * (page - 1),
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          Assignee: {
            include: {
              user: {
                select: {
                  avatar: true,
                  username: true,
                },
              },
            },
          },
          ProjectMember: {
            include: {
              user: {
                select: {
                  avatar: true,
                  username: true,
                },
              },
            },
          },
        },
      }),
    ]);
    return {
      total,
      items,
    };
  }

  async getMeOne(task_id: number) {
    return this.prismaService.task.findUnique({
      where: {
        id: task_id,
      },
      include: {
        TaskAttachment: true,
        TaskComment: {
          orderBy: [
            {
              createdAt: 'asc',
            },
          ],
          include: {
            projectMember: {
              include: {
                user: {
                  select: {
                    username: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        Assignee: {
          include: {
            user: {
              select: {
                username: true,
                avatar: true,
              },
            },
          },
        },
        ProjectMember: {
          include: {
            user: {
              select: {
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }
}
