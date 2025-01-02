import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { LoggedUserRequest } from 'src/auth/entities/logged-user.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportListItemEntity } from './entities/report.entity';
import { ReportFullEntity } from './entities/report-full.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportPaginationEntity } from './entities/list-report.entity';
import { MergeReportDto } from './dto/merge-report.dto';

@ApiTags('Reports')
@Controller('projects/:projectid/reports')
export class ReportsController {
  private logger = new Logger(ReportsController.name);
  constructor(private reportsService: ReportsService) {}
  @Get('me')
  @ApiResponse({
    status: 200,
    type: ReportPaginationEntity,
  })
  async listReports(
    @Request() { user }: LoggedUserRequest,
    @Param('projectid') projectId: string,
    @Query() reportQueryDto: ReportQueryDto,
  ): Promise<ReportPaginationEntity> {
    const { total, items } = await this.reportsService.findMany(
      +user.id,
      +projectId,
      reportQueryDto,
    );
    return {
      total,
      items: items.map((item) => new ReportListItemEntity(item)),
    };
  }
  @Post('me')
  @ApiResponse({
    status: 200,
    type: ReportFullEntity,
  })
  async createReport(
    @Request() { user }: LoggedUserRequest,
    @Body() reportData: CreateReportDto,
    @Param('projectid') projectid: string,
  ): Promise<ReportFullEntity> {
    const res = await this.reportsService.createReport(
      +user.id,
      +projectid,
      reportData,
    );
    return new ReportFullEntity(res);
  }
  @Patch('me/:id')
  @ApiResponse({
    status: 200,
    type: ReportFullEntity,
  })
  async updateReport(
    @Request() { user }: LoggedUserRequest,
    @Param('projectid') projectid: string,
    @Param('id') id: string,
    @Body() reportData: UpdateReportDto,
  ): Promise<ReportFullEntity> {
    const res = await this.reportsService.updateReport(
      +user.id,
      +projectid,
      +id,
      reportData,
    );
    if (!res) throw new ForbiddenException();
    else return new ReportFullEntity(res);
  }
  @Get('me/:id')
  @ApiResponse({
    status: 200,
    type: ReportFullEntity,
  })
  async getMyReport(@Param('id') id: string): Promise<ReportFullEntity> {
    const res = await this.reportsService.getMeOne(+id);
    const { DuplicateGroup1, DuplicateGroup2, Task, children, ...rest } = res;
    const DuplicateGroup = DuplicateGroup1.map((item) => ({
      level: item.level,
      id: item.report2.id,
      name: item.report2.name,
    }));
    DuplicateGroup.concat(
      DuplicateGroup2.map((item) => ({
        level: item.level,
        id: item.report1.id,
        name: item.report1.name,
      })),
    );

    return new ReportFullEntity({
      ...rest,
      DuplicateGroup,
      Task: Task.map((item) => ({ ...item, status: item.status?.name })),
      children,
    });
  }

  @Post('me/:id/merge')
  async mergeReport(
    @Param('id') id: string,
    @Body() mergeData: MergeReportDto,
  ) {
    return this.reportsService.mergeReport(+id, mergeData);
  }

  @Delete('me/:id')
  async deleteReport(
    @Request() { user }: LoggedUserRequest,
    @Param('id') id: string,
  ) {
    return this.reportsService.deleteReport(+user.id, +id);
  }
}
