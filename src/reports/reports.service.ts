import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { Prisma, ProjectRole, ReportStatus } from '@prisma/client';
import axios from 'axios';
import { MergeReportDto } from './dto/merge-report.dto';

@Injectable()
export class ReportsService {
  private logger = new Logger(ReportsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createReport(
    user_id: number,
    projectid: number,
    reportData: CreateReportDto,
  ) {
    const { images, phaseId, ...createReportDto } = reportData;
    let phaseIdInput = phaseId;
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
    const report = await this.prismaService.report.create({
      data: {
        projectId: projectid,
        createdById: user_id,
        phaseId: phaseIdInput,
        ...createReportDto,
      } as any,
      include: {
        ReportImage: true,
        ReportComment: {
          include: {
            createdBy: true,
          },
        },
      },
    });
    if (images?.length) {
      const reportImages =
        await this.prismaService.reportImage.createManyAndReturn({
          data: images.map((item) => ({ ...item, reportId: report.id })),
        });
      report.ReportImage = reportImages;
    }
    const res = await axios.post(
      `${this.configService.get<string>('AI_SERVER_URL') ?? 'localhost:8000'}/api/bug-reports/process`,
      { reportId: report.id },
    );
    if (res.data.success) {
      await this.prismaService.report.update({
        where: {
          id: report.id,
        },
        data: {
          isProcessing: true,
        },
      });
    }
    return report;
  }
  async updateReport(
    user_id: number,
    projectid: number,
    report_id: number,
    reportData: UpdateReportDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { newImages, deleteImages, images, ...updateReportDto } = reportData;
    if (updateReportDto.status === ReportStatus.DONE) {
      const children = await this.prismaService.task.count({
        where: {
          reportId: report_id,
        },
      });
      if (children > 0) {
        return false;
      }
    }
    if (deleteImages?.length) {
      await this.prismaService.reportImage.deleteMany({
        where: {
          id: {
            in: deleteImages,
          },
        },
      });
    }
    const report = await this.prismaService.report.update({
      where: {
        id: report_id,
        projectId: projectid,
        createdById: user_id,
      },
      data: {
        ...updateReportDto,
      } as any,
      include: {
        ReportImage: true,
        ReportComment: {
          include: {
            createdBy: true,
          },
        },
      },
    });
    if (!report) return;
    if (newImages?.length) {
      const reportImages =
        await this.prismaService.reportImage.createManyAndReturn({
          data: newImages.map((item) => ({ ...item, reportId: report.id })),
        });
      report.ReportImage.push(...reportImages);
    }
    return report;
  }

  async findMany(
    user_id: number,
    projectId: number,
    reportQueryDto: ReportQueryDto,
  ) {
    const {
      page,
      pageSize,
      role,
      severity,
      status,
      issueType,
      keyword,
      phaseId,
    } = reportQueryDto;
    const where: Prisma.ReportWhereInput = {
      projectId,
      parentId: {
        equals: null,
      },
    };
    if (role === 'owner') where.createdById = user_id;
    else if (role === 'assigned') where.assignedTo = user_id;
    else
      where.project = {
        projectMembers: {
          some: {
            userId: user_id,
            role: {
              category: ProjectRole.OWNER,
            },
          },
        },
      };
    if (severity) {
      where.severity = severity;
    }
    if (status) {
      where.status = status;
    }
    if (issueType) {
      where.issueType = issueType;
    }
    if (phaseId) {
      if (+phaseId == 0) {
        where.phaseId = null;
      } else where.phaseId = +phaseId;
    }
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
      this.prismaService.report.count({
        where,
      }),
      this.prismaService.report.findMany({
        where,
        skip: pageSize * (page - 1),
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          assignee: {
            select: {
              avatar: true,
              username: true,
            },
          },
          createdBy: {
            select: {
              avatar: true,
              username: true,
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

  async getMeOne(report_id: number) {
    return this.prismaService.report.findUnique({
      where: {
        id: report_id,
      },
      include: {
        ReportImage: true,
        ReportComment: {
          orderBy: [
            {
              createdAt: 'asc',
            },
          ],
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
        },
        assignee: {
          select: {
            avatar: true,
            username: true,
          },
        },
        createdBy: {
          select: {
            avatar: true,
            username: true,
          },
        },
        DuplicateGroup1: {
          select: {
            level: true,
            report2: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        DuplicateGroup2: {
          select: {
            level: true,
            report1: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        children: {
          select: {
            id: true,
            name: true,
          },
        },
        Task: {
          select: {
            id: true,
            name: true,
            status: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async updateReportInternal(report_id: number, reportData: UpdateReportDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { newImages, deleteImages, images, ...updateReportDto } = reportData;
    if (deleteImages?.length) {
      await this.prismaService.reportImage.deleteMany({
        where: {
          id: {
            in: deleteImages,
          },
        },
      });
    }
    const report = await this.prismaService.report.update({
      where: {
        id: report_id,
      },
      data: {
        ...updateReportDto,
      } as any,
    });
    if (!report) return;
    return report;
  }

  async mergeReport(report_id: number, mergeData: MergeReportDto) {
    const { childrenId, type } = mergeData;
    await this.prismaService.task.updateMany({
      where: {
        reportId: childrenId,
      },
      data: {
        reportId: report_id,
      },
    });
    let res;
    if (type === 'merge') {
      res = await this.prismaService.report.update({
        where: {
          id: childrenId,
        },
        data: {
          parentId: report_id,
        },
      });
    } else {
      await this.prismaService.report.updateMany({
        where: {
          parentId: childrenId,
        },
        data: {
          parentId: report_id,
        },
      });
      res = await this.prismaService.report.delete({
        where: {
          id: childrenId,
        },
      });
    }
    await this.prismaService.duplicateGroup.deleteMany({
      where: {
        OR: [
          {
            reportId1: report_id,
            reportId2: childrenId,
          },
          {
            reportId1: childrenId,
            reportId2: report_id,
          },
        ],
      },
    });
    return res;
  }
}
