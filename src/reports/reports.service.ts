import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { Prisma } from '@prisma/client';

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
    const { images, ...createReportDto } = reportData;
    const report = await this.prismaService.report.create({
      data: {
        projectId: projectid,
        createdById: user_id,
        ...createReportDto,
      } as any,
      include: {
        ReportImage: true,
        ReportComment: true,
      },
    });
    if (images?.length) {
      const reportImages =
        await this.prismaService.reportImage.createManyAndReturn({
          data: images.map((item) => ({ ...item, reportId: report.id })),
        });
      report.ReportImage = reportImages;
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
        ReportComment: true,
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
    const { page, pageSize, role } = reportQueryDto;
    const where: Prisma.ReportWhereInput = { projectId };
    if (role === 'owner') where.createdById = user_id;
    else where.assignedTo = user_id;
    const [total, items] = await this.prismaService.$transaction([
      this.prismaService.report.count({
        where,
      }),
      this.prismaService.report.findMany({
        where,
        skip: pageSize * (page - 1),
        take: pageSize,
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
      },
    });
  }
}
