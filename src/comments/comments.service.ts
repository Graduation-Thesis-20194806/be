import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskCommentQueryDto } from './dto/comment-query.dto';
import { Prisma } from '@prisma/client';
import { TaskCreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  private logger = new Logger(CommentsService.name);
  constructor(private readonly prismaService: PrismaService) {}
  async findMany(
    user_id: number,
    taskid: number,
    commentQueryDto: TaskCommentQueryDto,
  ) {
    const { page, pageSize } = commentQueryDto;
    const where: Prisma.TaskCommentWhereInput = {
      taskId: taskid,
      task: {
        OR: [
          {
            isPublic: true,
          },
          {
            isPublic: false,
            ProjectMember: {
              userId: user_id,
            },
          },
        ],
      },
    };
    const [total, items] = await this.prismaService.$transaction([
      this.prismaService.taskComment.count({
        where,
      }),
      this.prismaService.taskComment.findMany({
        where,
        orderBy: {
          createdAt: 'asc',
        },
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
        skip: pageSize * (page - 1),
        take: pageSize,
      }),
    ]);
    return {
      total,
      items,
    };
  }

  async createComment(
    user_id: number,
    project_id: number,
    taskid: number,
    createCommentDto: TaskCreateCommentDto,
  ) {
    const member = await this.prismaService.projectMember.findUnique({
      where: {
        userId_projectId: {
          projectId: project_id,
          userId: user_id,
        },
      },
    });
    return this.prismaService.taskComment.create({
      data: {
        ...createCommentDto,
        createdBy: member.id,
        taskId: taskid,
        projectId: project_id,
      },
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
    });
  }

  async updateComment(
    user_id: number,
    taskid: number,
    commentid: number,
    updateCommentDto: TaskCreateCommentDto,
  ) {
    return this.prismaService.taskComment.update({
      where: {
        id: commentid,
        taskId: taskid,
        projectMember: {
          userId: user_id,
        },
      },
      data: {
        ...updateCommentDto,
      },
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
    });
  }
  async delete(user_id: number, taskid: number, commentid: number) {
    return this.prismaService.taskComment.delete({
      where: {
        id: commentid,
        taskId: taskid,
        projectMember: {
          userId: user_id,
        },
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000),
        },
      },
    });
  }
}
