import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { messageType } from 'src/common/constant';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectsService } from 'src/projects/projects.service';
import { ReportsService } from 'src/reports/reports.service';

@Controller()
export class RedisController {
  constructor(
    private reportsService: ReportsService,
    private projectsService: ProjectsService,
    private prismaService: PrismaService,
  ) {}
  @EventPattern(process.env.REPORT_PROCESSED_CHANNEL)
  async handleRedisMessage(data: Record<string, any>) {
    if (!data.type) return;
    if (data.type === messageType.BUG_REPORT) {
      const { reportId, issueType } = data;
      if (!reportId || !issueType) return;
      const report = await this.reportsService.getMeOne(reportId);
      if (!report) return;
      const assign = await this.projectsService.getAssignByIssueType(
        report.projectId,
        issueType,
      );
      await this.reportsService.updateReportInternal(reportId, {
        issueType,
        isProcessing: false,
        assignedTo: assign?.Assignee.userId,
      });
    }
    if (data.type === messageType.BUG_DUPLICATE) {
      const { reportId } = data;
      if (!reportId) return;
      const { groupId, dupReportId } = data;
      if (groupId) {
        return await this.prismaService.report.update({
          where: {
            id: reportId,
          },
          data: {
            groupId,
          },
        });
      }
      if (dupReportId) {
        const dupReport = await this.prismaService.duplicateGroup.create({
          data: {},
        });
        await this.prismaService.report.updateMany({
          where: {
            id: {
              in: [dupReportId, reportId],
            },
          },
          data: {
            groupId: dupReport.id,
          },
        });
      }
    }
  }
}
