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
import { TaskCommentQueryDto } from './dto/comment-query.dto';
import { CommentsService } from './comments.service';
import { TaskCommentPaginateEntity } from './entities/list-task-comments.entity';
import { TaskCommentsEntity } from './entities/task-comments.entity';
import { TaskCreateCommentDto } from './dto/create-comment.dto';
import { GeneralResult } from 'src/common/entities/general-result.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Task Comments')
@Controller('projects/:projectid/tasks/:taskid/task-comments')
export class CommentsController {
  private logger = new Logger(CommentsController.name);
  constructor(private commentService: CommentsService) {}
  @Get('me')
  @ApiResponse({
    status: 200,
    type: TaskCommentPaginateEntity,
  })
  async listComments(
    @Request() { user }: LoggedUserRequest,
    @Param('taskid') taskid: string,
    @Query() queryData: TaskCommentQueryDto,
  ): Promise<TaskCommentPaginateEntity> {
    const { total, items } = await this.commentService.findMany(
      +user.id,
      +taskid,
      queryData,
    );
    return {
      total,
      items: items.map((item) => new TaskCommentsEntity(item)),
    };
  }

  @Post('me')
  @ApiResponse({
    status: 200,
    type: TaskCommentsEntity,
  })
  async createComment(
    @Request() { user }: LoggedUserRequest,
    @Param('taskid') taskid: string,
    @Param('projectid') projecid: string,
    @Body() createCommentDto: TaskCreateCommentDto,
  ): Promise<TaskCommentsEntity> {
    const res = await this.commentService.createComment(
      +user.id,
      +projecid,
      +taskid,
      createCommentDto,
    );
    return new TaskCommentsEntity(res);
  }

  @Patch('me/:id')
  @ApiResponse({
    status: 200,
    type: TaskCommentsEntity,
  })
  async updateComment(
    @Request() { user }: LoggedUserRequest,
    @Param('id') id: string,
    @Param('taskid') taskid: string,
    @Body() updateCommentDto: TaskCreateCommentDto,
  ): Promise<TaskCommentsEntity> {
    const res = await this.commentService.updateComment(
      +user.id,
      +taskid,
      +id,
      updateCommentDto,
    );
    return new TaskCommentsEntity(res);
  }

  @Delete('me/:id')
  @ApiResponse({
    status: 200,
    type: GeneralResult,
  })
  async deleteComment(
    @Request() { user }: LoggedUserRequest,
    @Param('id') id: string,
    @Param('taskid') taskid: string,
  ): Promise<GeneralResult> {
    const res = await this.commentService.delete(+user.id, +taskid, +id);
    if (res) return { success: true };
    else return { success: false };
  }
}
