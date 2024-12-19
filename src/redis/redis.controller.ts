import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { DuplicateLevel } from '@prisma/client';
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
      const { dupReportIds } = data;
      if (dupReportIds?.length) {
        await this.prismaService.duplicateGroup.createMany({
          data: dupReportIds.map(
            (item: { id: number; level: DuplicateLevel }) => ({
              reportId1: Math.min(item.id, reportId),
              reportId2: Math.max(item.id, reportId),
              level: item.level,
            }),
          ),
        });
      }
    }
  }
}
