import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatisticQueryDto } from './dto/statistic-query.dto';
import { Prisma, ProjectRole } from '@prisma/client';

@Injectable()
export class StatisticService {
  constructor(private prismaService: PrismaService) {}
  async getReportStatusCount(
    userId: number,
    projectId: number,
    statisticQuery: StatisticQueryDto,
  ) {
    const { from, to, role } = statisticQuery;
    const where = {
      projectId,
    } as Prisma.ReportWhereInput;
    if (from) {
      where.createdAt = {
        gte: new Date(from),
      };
    }
    if (to) {
      where.createdAt = {
        lte: new Date(to),
      };
    }
    if (role === 'owner') where.createdById = userId;
    else if (role === 'assigned') where.assignedTo = userId;
    else
      where.project = {
        projectMembers: {
          some: {
            userId: userId,
            role: {
              category: ProjectRole.OWNER,
            },
          },
        },
      };
    const result = await this.prismaService.report.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });

    return result.map((r) => ({
      status: r.status,
      count: r._count._all,
    }));
  }

  async getReportSeverityCount(
    userId: number,
    projectId: number,
    statisticQuery: StatisticQueryDto,
  ) {
    const { from, to, role } = statisticQuery;
    const where = {
      projectId,
    } as Prisma.ReportWhereInput;
    if (from) {
      where.createdAt = {
        gte: new Date(from),
      };
    }
    if (to) {
      where.createdAt = {
        lte: new Date(to),
      };
    }
    if (role === 'owner') where.createdById = userId;
    else if (role === 'assigned') where.assignedTo = userId;
    else
      where.project = {
        projectMembers: {
          some: {
            userId: userId,
            role: {
              category: ProjectRole.OWNER,
            },
          },
        },
      };
    const result = await this.prismaService.report.groupBy({
      by: ['severity'],
      where,
      _count: { _all: true },
    });

    return result.map((r) => ({
      severity: r.severity,
      count: r._count._all,
    }));
  }

  async getReportTypeCount(
    userId: number,
    projectId: number,
    statisticQuery: StatisticQueryDto,
  ) {
    const { from, to, role } = statisticQuery;
    const where = {
      projectId,
    } as Prisma.ReportWhereInput;
    if (from) {
      where.createdAt = {
        gte: new Date(from),
      };
    }
    if (to) {
      where.createdAt = {
        lte: new Date(to),
      };
    }
    if (role === 'owner') where.createdById = userId;
    else if (role === 'assigned') where.assignedTo = userId;
    else
      where.project = {
        projectMembers: {
          some: {
            userId: userId,
            role: {
              category: ProjectRole.OWNER,
            },
          },
        },
      };
    const result = await this.prismaService.report.groupBy({
      by: ['type'],
      where,
      _count: { _all: true },
    });

    return result.map((r) => ({
      type: r.type,

      count: r._count._all,
    }));
  }

  async getReportIssueTypeCount(
    userId: number,
    projectId: number,
    statisticQuery: StatisticQueryDto,
  ) {
    const { from, to, role } = statisticQuery;
    const where = {
      projectId,
    } as Prisma.ReportWhereInput;
    if (from) {
      where.createdAt = {
        gte: new Date(from),
      };
    }
    if (to) {
      where.createdAt = {
        lte: new Date(to),
      };
    }
    if (role === 'owner') where.createdById = userId;
    else if (role === 'assigned') where.assignedTo = userId;
    else
      where.project = {
        projectMembers: {
          some: {
            userId: userId,
            role: {
              category: ProjectRole.OWNER,
            },
          },
        },
      };
    const result = await this.prismaService.report.groupBy({
      by: ['issueType'],
      where,
      _count: { _all: true },
    });

    return result.map((r) => ({
      issueType: r.issueType,

      count: r._count._all,
    }));
  }

  formatDate(
    date?: Date,
    statisticType?: StatisticQueryDto['dateType'],
  ): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero based
    const day = String(date.getDate()).padStart(2, '0');
    switch (statisticType) {
      case 'month':
        return year + '-' + month;
      case 'year':
        return year + '';
      default:
        return year + '-' + month + '-' + day;
    }
  }

  async getReportStatisticByTime(
    userId: number,
    projectId: number,
    statisticQuery: StatisticQueryDto,
  ) {
    const { from, to, role, dateType } = statisticQuery;
    let fromDate, toDate;
    if (!from) fromDate = new Date('2024-01-01');
    else fromDate = new Date(from);
    if (!to) toDate = new Date();
    else toDate = new Date(to);
    const fromStr = this.formatDate(fromDate);
    const toStr = this.formatDate(toDate);
    let staticQuery;
    switch (dateType) {
      case 'month':
        switch (role) {
          case 'owner':
            staticQuery = Prisma.sql`
                SELECT
                    TO_CHAR("created_at",'YYYY-MM') AS "date",
                    CAST(COUNT("created_at") AS int) AS "count"
                    FROM "reports"
                    WHERE TO_CHAR("created_at",'YYYY-MM-DD') >= ${fromStr}
                    AND TO_CHAR("created_at",'YYYY-MM-DD') <= ${toStr}
                    AND "created_by_id" = ${userId}
                    AND "project_id" = ${projectId}
                    GROUP BY TO_CHAR("created_at",'YYYY-MM') 
                    ORDER BY TO_CHAR("created_at",'YYYY-MM') ASC
                `;
            break;
          case 'assigned':
            staticQuery = Prisma.sql`
                SELECT
                    TO_CHAR("created_at",'YYYY-MM') AS "date",
                    CAST(COUNT("created_at") AS int) AS "count"
                    FROM "reports"
                    WHERE TO_CHAR("created_at",'YYYY-MM-DD') >= ${fromStr}
                    AND TO_CHAR("created_at",'YYYY-MM-DD') <= ${toStr}
                    AND "assigned_to" = ${userId}
                    AND "project_id" = ${projectId}
                    GROUP BY TO_CHAR("created_at",'YYYY-MM') 
                    ORDER BY TO_CHAR("created_at",'YYYY-MM') ASC
                `;
            break;
          default:
            staticQuery = Prisma.sql`
                SELECT
                    TO_CHAR("created_at",'YYYY-MM') AS "date",
                    CAST(COUNT("created_at") AS int) AS "count"
                    FROM "reports"
                    WHERE TO_CHAR("created_at",'YYYY-MM-DD') >= ${fromStr}
                    AND TO_CHAR("created_at",'YYYY-MM-DD') <= ${toStr}
                    AND "project_id" = ${projectId}
                    GROUP BY TO_CHAR("created_at",'YYYY-MM') 
                    ORDER BY TO_CHAR("created_at",'YYYY-MM') ASC
                `;
        }
        break;
      case 'year':
        switch (role) {
          case 'owner':
            staticQuery = Prisma.sql`
                  SELECT
                      TO_CHAR("created_at",'YYYY') AS "date",
                      CAST(COUNT("created_at") AS int) AS "count"
                      FROM "reports"
                      WHERE TO_CHAR("created_at",'YYYY-MM-DD') >= ${fromStr}
                      AND TO_CHAR("created_at",'YYYY-MM-DD') <= ${toStr}
                      AND "created_by_id" = ${userId}
                      AND "project_id" = ${projectId}
                      GROUP BY TO_CHAR("created_at",'YYYY') 
                      ORDER BY TO_CHAR("created_at",'YYYY') ASC
                  `;
            break;
          case 'assigned':
            staticQuery = Prisma.sql`
                  SELECT
                      TO_CHAR("created_at",'YYYY') AS "date",
                      CAST(COUNT("created_at") AS int) AS "count"
                      FROM "reports"
                      WHERE TO_CHAR("created_at",'YYYY-MM-DD') >= ${fromStr}
                      AND TO_CHAR("created_at",'YYYY-MM-DD') <= ${toStr}
                      AND "assigned_to" = ${userId}
                      AND "project_id" = ${projectId}
                      GROUP BY TO_CHAR("created_at",'YYYY') 
                      ORDER BY TO_CHAR("created_at",'YYYY') ASC
                  `;
            break;
          default:
            staticQuery = Prisma.sql`
                  SELECT
                      TO_CHAR("created_at",'YYYY') AS "date",
                      CAST(COUNT("created_at") AS int) AS "count"
                      FROM "reports"
                      WHERE TO_CHAR("created_at",'YYYY-MM-DD') >= ${fromStr}
                      AND TO_CHAR("created_at",'YYYY-MM-DD') <= ${toStr}
                      AND "project_id" = ${projectId}
                      GROUP BY TO_CHAR("created_at",'YYYY') 
                      ORDER BY TO_CHAR("created_at",'YYYY') ASC
                  `;
        }
        break;
      default:
        switch (role) {
          case 'owner':
            staticQuery = Prisma.sql`
                  SELECT
                      TO_CHAR("created_at",'YYYY-MM-DD') AS "date",
                      CAST(COUNT("created_at") AS int) AS "count"
                      FROM "reports"
                      WHERE TO_CHAR("created_at",'YYYY-MM-DD') >= ${fromStr}
                      AND TO_CHAR("created_at",'YYYY-MM-DD') <= ${toStr}
                      AND "created_by_id" = ${userId}
                      AND "project_id" = ${projectId}
                      GROUP BY TO_CHAR("created_at",'YYYY-MM-DD') 
                      ORDER BY TO_CHAR("created_at",'YYYY-MM-DD') ASC
                  `;
            break;
          case 'assigned':
            staticQuery = Prisma.sql`
                  SELECT
                      TO_CHAR("created_at",'YYYY-MM-DD') AS "date",
                      CAST(COUNT("created_at") AS int) AS "count"
                      FROM "reports"
                      WHERE TO_CHAR("created_at",'YYYY-MM-DD') >= ${fromStr}
                      AND TO_CHAR("created_at",'YYYY-MM-DD') <= ${toStr}
                      AND "assigned_to" = ${userId}
                      AND "project_id" = ${projectId}
                      GROUP BY TO_CHAR("created_at",'YYYY-MM-DD') 
                      ORDER BY TO_CHAR("created_at",'YYYY-MM-DD') ASC
                  `;
            break;
          default:
            staticQuery = Prisma.sql`
                  SELECT
                      TO_CHAR("created_at",'YYYY-MM-DD') AS "date",
                      CAST(COUNT("created_at") AS int) AS "count"
                      FROM "reports"
                      WHERE TO_CHAR("created_at",'YYYY-MM-DD') >= ${fromStr}
                      AND TO_CHAR("created_at",'YYYY-MM-DD') <= ${toStr}
                      AND "project_id" = ${projectId}
                      GROUP BY TO_CHAR("created_at",'YYYY-MM-DD') 
                      ORDER BY TO_CHAR("created_at",'YYYY-MM-DD') ASC
                  `;
        }
    }
    return this.prismaService.$queryRaw(staticQuery);
  }
  async getReportStatisticByMember(
    userId: number,
    projectId: number,
    statisticQuery: StatisticQueryDto,
  ) {
    const { from, to, role } = statisticQuery;
    const where = {
      projectId,
    } as Prisma.ReportWhereInput;
    if (from) {
      where.createdAt = {
        gte: new Date(from),
      };
    }
    if (to) {
      where.createdAt = {
        lte: new Date(to),
      };
    }
    if (role === 'assigned') {
      where.assignedTo = userId;
      const result = await this.prismaService.report.groupBy({
        by: ['assignedTo'],
        where,
        _count: { _all: true },
      });
      return result.map((r) => ({
        userId: r.assignedTo,
        count: r._count._all,
      }));
    } else {
      where.createdById = userId;
      const result = await this.prismaService.report.groupBy({
        by: ['createdById'],
        where,
        _count: { _all: true },
      });
      return result.map((r) => ({
        userId: r.createdById,
        count: r._count._all,
      }));
    }
  }
}
