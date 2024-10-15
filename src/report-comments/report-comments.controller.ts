import {
  Controller,
  Get,
  Param,
  Request,
  Body,
  Logger,
  Post,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { LoggedUserRequest } from 'src/auth/entities/logged-user.entity';
import { ReportCommentsParams } from './dto/params.dto';
import { ReportCommentQueryDto } from './dto/comment-query.dto';
import { ReportCommentsService } from './report-comments.service';
import { ReportCommentPaginateEntity } from './entities/list-report-comments.entity';
import { ReportCommentsEntity } from './entities/report-comments.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GeneralResult } from 'src/common/entities/general-result.entity';
import { ApiResponse } from '@nestjs/swagger';

@Controller('projects/:projectid/reports/:reportid/report-comments')
export class ReportCommentsController {
  private logger = new Logger(ReportCommentsController.name);
  constructor(private commentService: ReportCommentsService) {}
  @Get('me')
  @ApiResponse({
    status: 200,
    type: ReportCommentPaginateEntity,
  })
  async listComments(
    @Request() { user }: LoggedUserRequest,
    @Param() { reportid }: ReportCommentsParams,
    @Query() queryData: ReportCommentQueryDto,
  ): Promise<ReportCommentPaginateEntity> {
    const { total, items } = await this.commentService.findMany(
      +user.id,
      +reportid,
      queryData,
    );
    return {
      total,
      items: items.map((item) => new ReportCommentsEntity(item)),
    };
  }

  @Post('me')
  @ApiResponse({
    status: 200,
    type: ReportCommentsEntity,
  })
  async createComment(
    @Request() { user }: LoggedUserRequest,
    @Param() { reportid }: ReportCommentsParams,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<ReportCommentsEntity> {
    const res = await this.commentService.createComment(
      +user.id,
      +reportid,
      createCommentDto,
    );
    return new ReportCommentsEntity(res);
  }

  @Patch('me/:id')
  @ApiResponse({
    status: 200,
    type: ReportCommentsEntity,
  })
  async updateComment(
    @Request() { user }: LoggedUserRequest,
    @Param() { reportid, id }: ReportCommentsParams & { id: string },
    @Body() updateCommentDto: CreateCommentDto,
  ): Promise<ReportCommentsEntity> {
    const res = await this.commentService.updateComment(
      +user.id,
      +reportid,
      +id,
      updateCommentDto,
    );
    return new ReportCommentsEntity(res);
  }

  @Delete('me/:id')
  @ApiResponse({
    status: 200,
    type: GeneralResult,
  })
  async deleteComment(
    @Request() { user }: LoggedUserRequest,
    @Param() { reportid, id }: ReportCommentsParams & { id: string },
  ): Promise<GeneralResult> {
    const res = await this.commentService.delete(+user.id, +reportid, +id);
    if (res) return { success: true };
    else return { success: false };
  }
}
