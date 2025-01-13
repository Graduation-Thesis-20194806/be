import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { Prisma, TaskStatusCategory, TaskType } from '@prisma/client';
import { GithubService } from 'src/github/github.service';

@Injectable()
export class TasksService {
  private logger = new Logger(TasksService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly githubService: GithubService,
  ) {}

  async createTask(
    user_id: number,
    projectid: number,
    taskData: CreateTaskDto,
  ) {
    const { attachments, phaseId, repoId, statusId, ...createTaskDto } =
      taskData;
    let phaseIdInput = phaseId;
    let statusIdInput = statusId;
    if (!phaseId) {
      const phase = await this.prismaService.phase.findFirst({
        where: {
          projectId: projectid,
          from: {
            lte: new Date(),
          },
          to: {
            gte: new Date(),
          },
        },
      });
      phaseIdInput = phase?.id;
    }
    if (!statusIdInput) {
      const status = await this.prismaService.status.findFirst({
        where: {
          projectId: projectid,
          category: TaskStatusCategory.OPEN,
        },
      });
      statusIdInput = status?.id;
    }
    const task = await this.prismaService.task.create({
      data: {
        projectId: projectid,
        createdBy: user_id,
        phaseId: phaseIdInput,
        ...createTaskDto,
      } as any,
      include: {
        TaskAttachment: {
          include: {
            file: true,
          },
        },
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
        Report: {
          select: {
            name: true,
          },
        },
        IssueGithub: true,
      },
    });

    if (attachments?.length) {
      const taskAttachments =
        await this.prismaService.taskAttachment.createManyAndReturn({
          data: attachments.map((item) => ({ fileId: item, taskId: task.id })),
          include: {
            file: true,
          },
        });
      task.TaskAttachment = taskAttachments;
    }
    const taskType = task.type;
    if (taskType == TaskType.GITHUB) {
      const user = await this.prismaService.user.findUnique({
        where: { id: user_id },
      });
      if (!repoId || !user.githubId) throw new BadRequestException();
      const repo = await this.prismaService.githubRepo.findUnique({
        where: { id: repoId },
      });
      const githubIssue = await this.githubService.createIssue(
        user.githubAccessToken,
        repo.owner,
        repo.name,
        {
          title: task.name,
          body: task.description,
        },
      );
      if (!githubIssue) throw new InternalServerErrorException();
      const IssueGithub = await this.prismaService.issueGithub.create({
        data: {
          repoId,
          taskId: task.id,
          number: githubIssue.number,
          url: githubIssue.html_url,
        },
      });
      task.IssueGithub = IssueGithub;
    }
    return task;
  }
  async updateTask(
    user_id: number,
    projectid: number,
    task_id: number,
    taskData: UpdateTaskDto,
  ) {
    const oldTask = await this.prismaService.task.findUnique({
      where: {
        id: task_id,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { newAttachments, deleteAttachments, attachments, ...updateTaskDto } =
      taskData;
    if (deleteAttachments?.length) {
      await this.prismaService.taskAttachment.deleteMany({
        where: {
          fileId: {
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
        TaskAttachment: {
          include: {
            file: true,
          },
        },
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
        Report: {
          select: {
            name: true,
          },
        },
        IssueGithub: {
          include: { repo: true },
        },
        status: {
          select: {
            category: true,
          },
        },
      },
    });
    if (!task) return;
    if (
      task.type === TaskType.GITHUB &&
      (oldTask.name !== task.name ||
        oldTask.description !== task.description ||
        oldTask.statusId !== task.statusId)
    ) {
      const state =
        task.status.category === TaskStatusCategory.CLOSE ? 'closed' : 'open';
      const user = await this.prismaService.user.findUnique({
        where: { id: user_id },
      });
      if (!user?.githubAccessToken) throw new BadRequestException();
      await this.githubService.updateIssue(
        user.githubAccessToken,
        task.IssueGithub.repo.owner,
        task.IssueGithub.repo.name,
        task.IssueGithub.number,
        {
          title: task.name,
          body: task.description,
          state,
        },
      );
    }
    if (newAttachments?.length) {
      const taskAttachments =
        await this.prismaService.taskAttachment.createManyAndReturn({
          data: newAttachments.map((item) => ({
            fileId: item,
            taskId: task.id,
          })),
          include: {
            file: true,
          },
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
    const { page, pageSize, role, keyword, categoryId, statusId, phaseId } =
      taskQueryDto;
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
    if (categoryId) {
      where.categoryId = +categoryId;
    }
    if (statusId) {
      where.statusId = +statusId;
    }

    if (phaseId) {
      if (+phaseId == 0) {
        where.phaseId = null;
      } else where.phaseId = +phaseId;
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
          Report: {
            select: {
              name: true,
            },
          },
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
          IssueGithub: true,
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
        TaskAttachment: {
          include: {
            file: true,
          },
        },
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
        Report: {
          select: {
            name: true,
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
        IssueGithub: true,
      },
    });
  }
  async deleteTask(user_id: number, task_id: number) {
    return this.prismaService.task.delete({
      where: {
        createdBy: user_id,
        id: task_id,
      },
    });
  }
}
