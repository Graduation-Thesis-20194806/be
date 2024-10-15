import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportCommentQueryDto } from './dto/comment-query.dto';
import { Prisma } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class ReportCommentsService {
  private logger = new Logger(ReportCommentsService.name);
  constructor(private readonly prismaService: PrismaService) {}
  async findMany(
    user_id: number,
    reportid: number,
    commentQueryDto: ReportCommentQueryDto,
  ) {
    const { page, pageSize } = commentQueryDto;
    const where: Prisma.ReportCommentWhereInput = {
      reportId: reportid,
      report: {
        OR: [
          {
            isPublic: true,
          },
          {
            isPublic: false,
            createdById: user_id,
          },
        ],
      },
    };
    const [total, items] = await this.prismaService.$transaction([
      this.prismaService.reportComment.count({
        where,
      }),
      this.prismaService.reportComment.findMany({
        where,
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          createdBy: {
            select: {
              username: true,
              avatar: true,
            },
          },
          id: true,
          createdById: true,
          createdAt: true,
          updatedAt: true,
          content: true,
          reportId: true,
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
    reportid: number,
    createCommentDto: CreateCommentDto,
  ) {
    return this.prismaService.reportComment.create({
      data: {
        ...createCommentDto,
        createdById: user_id,
        reportId: reportid,
      },
      select: {
        createdBy: {
          select: {
            username: true,
            avatar: true,
          },
        },
        id: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        content: true,
        reportId: true,
      },
    });
  }

  async updateComment(
    user_id: number,
    reportid: number,
    commentid: number,
    updateCommentDto: CreateCommentDto,
  ) {
    return this.prismaService.reportComment.update({
      where: {
        id: commentid,
        reportId: reportid,
        createdById: user_id,
      },
      data: {
        ...updateCommentDto,
      },
      select: {
        createdBy: {
          select: {
            username: true,
            avatar: true,
          },
        },
        id: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        content: true,
        reportId: true,
      },
    });
  }
  async delete(user_id: number, reportid: number, commentid: number) {
    return this.prismaService.reportComment.delete({
      where: {
        id: commentid,
        reportId: reportid,
        createdById: user_id,
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000),
        },
      },
    });
  }
}
