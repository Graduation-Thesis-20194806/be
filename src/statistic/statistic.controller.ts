import { Controller, Get, Logger, Param, Query, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StatisticService } from './statistic.service';
import { LoggedUserRequest } from 'src/auth/entities/logged-user.entity';
import { StatisticQueryDto } from './dto/statistic-query.dto';

@ApiTags('Statistic')
@Controller('projects/:projectid/statistic')
export class StatisticController {
  private logger = new Logger(StatisticController.name);
  constructor(private readonly statisticService: StatisticService) {}

  @Get('report-status-count')
  @ApiOperation({ summary: 'Get count of reports by status' })
  @ApiResponse({
    status: 200,
    description: 'Returns array of objects with {status, count}',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['INIT', 'CONFIRMING', 'IN_PROCESSING', 'REJECTED', 'DONE'],
          },
          count: { type: 'number' },
        },
      },
    },
  })
  getReportStatusCount(
    @Request() { user }: LoggedUserRequest,
    @Param('projectid') projectid: string,
    @Query() statisticQueryDto: StatisticQueryDto,
  ) {
    return this.statisticService.getReportStatusCount(
      user.id,
      +projectid,
      statisticQueryDto,
    );
  }

  @Get('report-severity-count')
  @ApiOperation({ summary: 'Get count of reports by severity' })
  @ApiResponse({
    status: 200,
    description: 'Returns array of objects with {severity, count}',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: {
            type: 'string',
            enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'null'],
          },
          count: { type: 'number' },
        },
      },
    },
  })
  getReportSeverityCount(
    @Request() { user }: LoggedUserRequest,
    @Param('projectid') projectid: string,
    @Query() statisticQueryDto: StatisticQueryDto,
  ) {
    return this.statisticService.getReportSeverityCount(
      user.id,
      +projectid,
      statisticQueryDto,
    );
  }

  @Get('report-type-count')
  @ApiOperation({ summary: 'Get count of reports by type' })
  @ApiResponse({
    status: 200,
    description: 'Returns array of objects with {type, count}',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['BUG', 'FEEDBACK', 'WISH'] },
          count: { type: 'number' },
        },
      },
    },
  })
  getReportTypeCount(
    @Request() { user }: LoggedUserRequest,
    @Param('projectid') projectid: string,
    @Query() statisticQueryDto: StatisticQueryDto,
  ) {
    return this.statisticService.getReportTypeCount(
      user.id,
      +projectid,
      statisticQueryDto,
    );
  }

  @Get('report-issue-type-count')
  @ApiOperation({ summary: 'Get count of reports by type' })
  @ApiResponse({
    status: 200,
    description: 'Returns array of objects with {type, count}',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          issueType: {
            type: 'string',
            enum: [
              'UI',
              'FUNCTIONAL',
              'PERFORMANCE',
              'SECURITY',
              'NETWORK',
              'DATA',
              'OTHER',
            ],
          },
          count: { type: 'number' },
        },
      },
    },
  })
  getReportIssueTypeCount(
    @Request() { user }: LoggedUserRequest,
    @Param('projectid') projectid: string,
    @Query() statisticQueryDto: StatisticQueryDto,
  ) {
    return this.statisticService.getReportIssueTypeCount(
      user.id,
      +projectid,
      statisticQueryDto,
    );
  }

  @Get('reports-by-time')
  @ApiOperation({
    summary:
      'Get the number of reports created each day/month/type over a given period',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns array of objects with {date, count}',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string', example: '2024-01' },
          count: { type: 'number' },
        },
      },
    },
  })
  getReportStatisticByTime(
    @Request() { user }: LoggedUserRequest,
    @Param('projectid') projectid: string,
    @Query() statisticQueryDto: StatisticQueryDto,
  ) {
    return this.statisticService.getReportStatisticByTime(
      user.id,
      +projectid,
      statisticQueryDto,
    );
  }

  @Get('reports-by-member')
  @ApiOperation({
    summary:
      'Get the number of reports owned/assigned by member over a given period',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns array of objects with {date, count}',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: { type: 'number' },
          count: { type: 'number' },
        },
      },
    },
  })
  getReportStatisticByMember(
    @Request() { user }: LoggedUserRequest,
    @Param('projectid') projectid: string,
    @Query() statisticQueryDto: StatisticQueryDto,
  ) {
    return this.statisticService.getReportStatisticByMember(
      user.id,
      +projectid,
      statisticQueryDto,
    );
  }
}
