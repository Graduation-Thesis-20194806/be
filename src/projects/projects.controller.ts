import {
  Controller,
  Logger,
  Post,
  Request,
  Body,
  Get,
  Query,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project';
import { LoggedUserRequest } from 'src/auth/entities/logged-user.entity';
import { ProjectQueryDto } from './dto/project-query.dto';
import { ProjectPaginateEntity } from './entities/list-project.entity';
import { ProjectEntity } from './entities/project.entity';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleEntity } from 'src/users/entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { GeneralResult } from 'src/common/entities/general-result.entity';
import { MemberPaginateEntity } from './entities/list-member.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Public } from 'src/auth/decorator/public-guard.decorator';
import { Auth } from 'src/auth/decorator/auth.decorator';

@ApiBearerAuth()
@ApiTags('Projects')
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

  @Get('me/:id')
  @ApiResponse({
    status: 200,
    type: ProjectEntity,
  })
  async getProject(
    @Request() { user }: LoggedUserRequest,
    @Param('id') id: string,
  ): Promise<ProjectEntity> {
    const res = await this.projectsService.getOne(+user.id, +id);
    return new ProjectEntity({
      ...res,
      userRole: res.projectMembers?.find((item) => item.userId == user.id).role,
    });
  }
  @Auth()
  @Get(':id/roles')
  @ApiResponse({
    status: 200,
    type: RoleEntity,
    isArray: true,
  })
  async getRoles(
    @Request() { user }: LoggedUserRequest,
    @Param('id') id: string,
  ) {
    return this.projectsService.getProjectRoles(+user.id, +id);
  }

  @Auth('roles:add')
  @Post(':projectid/roles')
  @ApiResponse({
    status: 200,
    type: ProjectEntity,
  })
  async createRole(
    @Body() roleDto: CreateRoleDto,
    @Param('projectid') projectid: string,
  ) {
    return this.projectsService.createRole(+projectid, roleDto);
  }

  @Auth('roles:delete')
  @Delete(':projectid/roles/:roleid')
  @ApiResponse({
    status: 200,
    type: GeneralResult,
  })
  async deleteRole(
    @Param('projectid') projectid: string,
    @Param('roleid') roleid: string,
  ): Promise<GeneralResult> {
    return this.projectsService.deleteRole(+projectid, +roleid);
  }

  @Auth()
  @Get(':projectid/members')
  @ApiResponse({
    status: 200,
    type: MemberPaginateEntity,
  })
  async getMembers(@Param('projectid') projectid: string) {
    const { total, items } =
      await this.projectsService.getProjectMembers(+projectid);
    return {
      total,
      items: items.map(
        (item) => new UserEntity({ ...item.user, role: item.role }),
      ),
    };
  }

  @Auth('members:delete')
  @Delete(':projectid/members/:userid')
  @ApiResponse({
    status: 200,
    type: GeneralResult,
  })
  async deleteMember(
    @Param('projectid') projectid: string,
    @Param('userid') userid: string,
  ) {
    const res = await this.projectsService.deleteMember(+projectid, +userid);
    if (res) return { success: true };
    else return { success: false };
  }

  @Auth('members:invite')
  @Get(':projectid/invite')
  async getInvitationLink(
    @Param('projectid') projectid: string,
    @Query('email') email: string,
    @Query('roleid') roleid: number,
  ) {
    const link = await this.projectsService.inviteMember(
      +projectid,
      email,
      roleid,
    );
    if (link)
      return {
        invitationLink: link,
      };
    else throw new BadRequestException();
  }
  @Public()
  @Get(':projectid/invite/verify')
  @ApiResponse({
    status: 200,
    type: GeneralResult,
  })
  async verifyMember(
    @Param('projectid') projectid: string,
    @Query('token') token: string,
  ) {
    const res = await this.projectsService.verifyMember(+projectid, token);
    if (!res) throw new BadRequestException();
    return {
      success: true,
    };
  }
}
