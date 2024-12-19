import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { LoggedUserRequest } from 'src/auth/entities/logged-user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { TaskListItemEntity } from './entities/task.entity';
import { TaskFullEntity } from './entities/task-full.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskPaginationEntity } from './entities/list-task.entity';

@ApiTags('Tasks')
@Controller('projects/:projectid/tasks')
export class TasksController {
  private logger = new Logger(TasksController.name);
  constructor(private tasksService: TasksService) {}
  @Get('me')
  @ApiResponse({
    status: 200,
    type: TaskPaginationEntity,
  })
  async listTasks(
    @Request() { user }: LoggedUserRequest,
    @Param('projectid') projectId: string,
    @Query() taskQueryDto: TaskQueryDto,
  ): Promise<TaskPaginationEntity> {
    const { total, items } = await this.tasksService.findMany(
      +user.id,
      +projectId,
      taskQueryDto,
    );
    return {
      total,
      items: items.map((item) => new TaskListItemEntity(item)),
    };
  }
  @Post('me')
  @ApiResponse({
    status: 200,
    type: TaskFullEntity,
  })
  async createTask(
    @Request() { user }: LoggedUserRequest,
    @Body() taskData: CreateTaskDto,
    @Param('projectid') projectid: string,
  ): Promise<TaskFullEntity> {
    const res = await this.tasksService.createTask(
      +user.id,
      +projectid,
      taskData,
    );
    return new TaskFullEntity(res);
  }
  @Patch('me/:id')
  @ApiResponse({
    status: 200,
    type: TaskFullEntity,
  })
  async updateTask(
    @Request() { user }: LoggedUserRequest,
    @Param('projectid') projectid: string,
    @Param('id') id: string,
    @Body() taskData: UpdateTaskDto,
  ): Promise<TaskFullEntity> {
    const res = await this.tasksService.updateTask(
      +user.id,
      +projectid,
      +id,
      taskData,
    );
    if (!res) throw new ForbiddenException();
    else return new TaskFullEntity(res);
  }
  @Get('me/:id')
  @ApiResponse({
    status: 200,
    type: TaskFullEntity,
  })
  async getMyTask(@Param('id') id: string): Promise<TaskFullEntity> {
    const res = await this.tasksService.getMeOne(+id);
    return new TaskFullEntity(res);
  }

  @ApiOperation({ summary: 'Create Github Issue' })
  @Post(':projectId/github/sync')
  async createGithubIssue(
    @Request() { user }: LoggedUserRequest,
    @Body() taskData: CreateTaskDto,
    @Param('projectid') projectid: string,
  ) {
    const res = await this.tasksService.createTask(
      +user.id,
      +projectid,
      taskData,
    );
    return new TaskFullEntity(res);
  }
}
