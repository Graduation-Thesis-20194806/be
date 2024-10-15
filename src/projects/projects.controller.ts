import {
  Controller,
  Logger,
  Post,
  Request,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project';
import { LoggedUserRequest } from 'src/auth/entities/logged-user.entity';
import { ProjectQueryDto } from './dto/project-query.dto';
import { ProjectPaginateEntity } from './entities/list-project.entity';
import { ProjectEntity } from './entities/project.entity';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  private logger = new Logger(ProjectsController.name);
  constructor(private projectsService: ProjectsService) {}
  @Get('me')
  @ApiResponse({
    status: 200,
    type: ProjectPaginateEntity,
  })
  async listProjects(
    @Request() { user }: LoggedUserRequest,
    @Query() projectQueryDto: ProjectQueryDto,
  ): Promise<ProjectPaginateEntity> {
    const { total, items } = await this.projectsService.findManyOwn(
      +user.id,
      projectQueryDto,
    );
    return {
      total,
      items: items.map(
        ({ projectMembers, ...rest }) =>
          new ProjectEntity({ ...rest, userRole: projectMembers?.at(0)?.role }),
      ),
    };
  }
  @Post('create')
  @ApiResponse({
    status: 200,
    type: ProjectEntity,
  })
  async createProject(
    @Request() { user }: LoggedUserRequest,
    @Body() projectData: CreateProjectDto,
  ): Promise<ProjectEntity> {
    const res = await this.projectsService.createProject(+user.id, projectData);
    return new ProjectEntity(res);
  }
}
