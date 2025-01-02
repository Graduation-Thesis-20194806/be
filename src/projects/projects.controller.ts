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
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { LoggedUserRequest } from 'src/auth/entities/logged-user.entity';
import { ProjectQueryDto } from './dto/project-query.dto';
import { ProjectPaginateEntity } from './entities/list-project.entity';
import { GithubRepoEntity, ProjectEntity } from './entities/project.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleEntity } from 'src/users/entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { GeneralResult } from 'src/common/entities/general-result.entity';
import { MemberPaginateEntity } from './entities/list-member.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Public } from 'src/auth/decorator/public-guard.decorator';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { CreateProjectStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { StatusEntity } from './entities/status.entity';
import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { PhaseEntity } from './entities/phase.entity';
import { AssignIssueTypeDto } from './dto/assign-issue-type.dto';
import { UpdateAssignDto } from './dto/update-assign.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectDomainDto } from './dto/create-project-url.dto';
import { UpdateProjectDomainDto } from './dto/update-project-url.dto';
import { ProjectDomainEntity } from './entities/project-domain.entity';
import { GithubService } from 'src/github/github.service';
import { UsersService } from 'src/users/users.service';
import { UpdateReposDto } from './dto/update-repos.dto';

@ApiBearerAuth()
@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  private logger = new Logger(ProjectsController.name);
  constructor(
    private projectsService: ProjectsService,
    private githubService: GithubService,
    private userService: UsersService,
  ) {}
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

  @ApiOperation({ summary: 'Update an existing project' })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully.',
    type: ProjectEntity,
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @Auth('projects:update-own')
  @Patch('me/:id')
  updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(+id, updateProjectDto);
  }

  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @Auth('projects:delete-own')
  @Delete('me/:id')
  deleteProject(@Param('id') id: string) {
    return this.projectsService.deleteProject(+id);
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

  @Post(':projectid/status')
  @ApiOperation({ summary: 'Create a new status' })
  @ApiResponse({
    status: 201,
    description: 'The status has been successfully created.',
    type: StatusEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  createStatus(
    @Body() createStatusDto: CreateProjectStatusDto,
    @Param('projectid') projectid: string,
  ) {
    return this.projectsService.createStatus(+projectid, createStatusDto);
  }

  @Get(':projectid/status')
  @ApiOperation({ summary: 'Get all statuses' })
  @ApiResponse({
    status: 200,
    description: 'List of statuses retrieved successfully.',
    type: StatusEntity,
    isArray: true,
  })
  findAllStatus(@Param('projectid') projectid: string) {
    return this.projectsService.findAllStatus(+projectid);
  }

  @Get(':projectid/status/:id')
  @ApiOperation({ summary: 'Get a single status by ID' })
  @ApiResponse({
    status: 200,
    description: 'Status retrieved successfully.',
    type: StatusEntity,
  })
  @ApiResponse({ status: 404, description: 'Status not found.' })
  findOneStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('projectid') projectid: string,
  ) {
    return this.projectsService.findOneStatus(+projectid, id);
  }

  @Patch(':projectid/status/:id')
  @ApiOperation({ summary: 'Update an existing status by ID' })
  @ApiResponse({
    status: 200,
    description: 'The status has been successfully updated.',
    type: StatusEntity,
  })
  @ApiResponse({ status: 404, description: 'Status not found.' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('projectid') projectid: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.projectsService.updateStatus(+projectid, id, updateStatusDto);
  }

  @Delete(':projectid/status/:id')
  @ApiOperation({ summary: 'Delete a status by ID' })
  @ApiResponse({
    status: 200,
    description: 'The status has been successfully deleted.',
    type: StatusEntity,
  })
  @ApiResponse({ status: 404, description: 'Status not found.' })
  removeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('projectid') projectid: string,
  ) {
    return this.projectsService.removeStatus(+projectid, id);
  }

  @Post(':projectid/category')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'The category has been successfully created.',
    type: CategoryEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @Param('projectid') projectid: string,
  ) {
    return this.projectsService.createCategory(+projectid, createCategoryDto);
  }

  @Get(':projectid/category')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'List of categories retrieved successfully.',
    type: CategoryEntity,
    isArray: true,
  })
  findAllCategory(@Param('projectid') projectid: string) {
    return this.projectsService.findAllCategory(+projectid);
  }

  @Get(':projectid/category/:id')
  @ApiOperation({ summary: 'Get a single category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully.',
    type: CategoryEntity,
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  findOneCategory(
    @Param('id', ParseIntPipe) id: number,
    @Param('projectid') projectid: string,
  ) {
    return this.projectsService.findOneCategory(+projectid, id);
  }

  @Patch(':projectid/category/:id')
  @ApiOperation({ summary: 'Update an existing category by ID' })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully updated.',
    type: CategoryEntity,
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Param('projectid') projectid: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.projectsService.updateCategory(
      +projectid,
      id,
      updateCategoryDto,
    );
  }

  @Delete(':projectid/category/:id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully deleted.',
    type: CategoryEntity,
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  removeCategory(
    @Param('id', ParseIntPipe) id: number,
    @Param('projectid') projectid: string,
  ) {
    return this.projectsService.removeCategory(+projectid, id);
  }

  @Post(':projectid/phases')
  @ApiOperation({ summary: 'Create a new Phase' })
  @ApiParam({
    name: 'projectid',
    type: Number,
    required: true,
    description: 'Project ID',
  })
  @ApiResponse({
    status: 201,
    description: 'Phase created successfully.',
    type: PhaseEntity,
  })
  createPhase(
    @Param('projectid', ParseIntPipe) projectId: number,
    @Body() createPhaseDto: CreatePhaseDto,
  ) {
    return this.projectsService.createPhase(projectId, createPhaseDto);
  }

  @Get(':projectid/phases')
  @ApiOperation({ summary: 'Get all Phases for a Project' })
  @ApiParam({
    name: 'projectid',
    type: Number,
    required: true,
    description: 'Project ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of phases returned successfully.',
    type: PhaseEntity,
    isArray: true,
  })
  findAllPhases(@Param('projectid', ParseIntPipe) projectId: number) {
    return this.projectsService.findAllPhases(projectId);
  }

  @Get(':projectid/phases/:id')
  @ApiOperation({ summary: 'Get a single Phase by ID' })
  @ApiParam({ name: 'projectid', type: Number, description: 'Project ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Phase ID' })
  @ApiResponse({
    status: 200,
    description: 'Phase returned successfully.',
    type: PhaseEntity,
  })
  @ApiResponse({ status: 404, description: 'Phase not found.' })
  findOnePhase(
    @Param('projectid', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.findOnePhase(projectId, id);
  }

  @Patch(':projectid/phases/:id')
  @ApiOperation({ summary: 'Update a Phase by ID' })
  @ApiParam({ name: 'projectid', type: Number, description: 'Project ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Phase ID' })
  @ApiResponse({
    status: 200,
    description: 'Phase updated successfully.',
    type: PhaseEntity,
  })
  @ApiResponse({ status: 404, description: 'Phase not found.' })
  updatePhase(
    @Param('projectid', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePhaseDto: UpdatePhaseDto,
  ) {
    return this.projectsService.updatePhase(projectId, id, updatePhaseDto);
  }

  @Delete(':projectid/phases/:id')
  @ApiOperation({ summary: 'Delete a Phase by ID' })
  @ApiParam({ name: 'projectid', type: Number, description: 'Project ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Phase ID' })
  @ApiResponse({
    status: 200,
    description: 'Phase deleted successfully.',
    type: PhaseEntity,
  })
  @ApiResponse({ status: 404, description: 'Phase not found.' })
  removePhase(
    @Param('projectid', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.removePhase(projectId, id);
  }

  @ApiParam({ name: 'projectId', example: 1 })
  @ApiBody({ type: AssignIssueTypeDto })
  @Post(':projectId/assign-issue-type')
  assignIssueType(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: AssignIssueTypeDto,
  ) {
    return this.projectsService.assignIssueType(projectId, dto);
  }

  @ApiOperation({ summary: 'Get all assignments in a project' })
  @ApiParam({ name: 'projectId', example: 1 })
  @Get(':projectId/assign-issue-type')
  getAssigns(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.projectsService.getAssigns(projectId);
  }

  @ApiOperation({ summary: 'Get a specific assignment in a project' })
  @ApiParam({ name: 'projectId', example: 1 })
  @ApiParam({ name: 'assignId', example: 10 })
  @Get(':projectId/assign-issue-type/:assignId')
  getAssignById(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('assignId', ParseIntPipe) assignId: number,
  ) {
    return this.projectsService.getAssignById(projectId, assignId);
  }

  @ApiOperation({ summary: 'Update issueType for an assignment' })
  @ApiParam({ name: 'projectId', example: 1 })
  @ApiParam({ name: 'assignId', example: 10 })
  @ApiBody({ type: UpdateAssignDto })
  @Patch(':projectId/assign-issue-type/:assignId')
  updateAssign(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('assignId', ParseIntPipe) assignId: number,
    @Body() dto: UpdateAssignDto,
  ) {
    return this.projectsService.updateAssign(projectId, assignId, dto);
  }

  @ApiOperation({ summary: 'Delete an assignment' })
  @ApiParam({ name: 'projectId', example: 1 })
  @ApiParam({ name: 'assignId', example: 10 })
  @Delete(':projectId/assign-issue-type/:assignId')
  removeAssign(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('assignId', ParseIntPipe) assignId: number,
  ) {
    return this.projectsService.deleteAssign(projectId, assignId);
  }

  @ApiOperation({ summary: 'Create a new ProjectDomain' })
  @ApiResponse({
    status: 201,
    description: 'ProjectDomain created successfully.',
    type: ProjectDomainEntity,
  })
  @Auth('projects:create-domains')
  @Post(':projectId/domains')
  createProjectDomain(
    @Param('projectId') projectId: string,
    @Body() createProjectDomainDto: CreateProjectDomainDto,
  ) {
    return this.projectsService.createProjectDomain(
      +projectId,
      createProjectDomainDto,
    );
  }

  @ApiOperation({ summary: 'Get all ProjectDomains' })
  @ApiResponse({
    status: 200,
    description: 'List of ProjectDomains.',
    isArray: true,
    type: ProjectDomainEntity,
  })
  @Auth('projects:view-domains')
  @Get(':projectId/domains')
  findAllProjectDomains(@Param('projectId') projectId: string) {
    return this.projectsService.findAllProjectDomains(+projectId);
  }

  @ApiOperation({ summary: 'Get a ProjectDomain by its ID' })
  @ApiResponse({
    status: 200,
    description: 'ProjectDomain found.',
    type: ProjectDomainEntity,
  })
  @ApiResponse({ status: 404, description: 'ProjectDomain not found.' })
  @Auth('projects:view-domains')
  @Get(':projectId/domains/:id')
  findOneProjectDomain(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
  ) {
    return this.projectsService.findOneProjectDomain(+projectId, +id);
  }

  @ApiOperation({ summary: 'Update a ProjectDomain' })
  @ApiResponse({
    status: 200,
    description: 'ProjectDomain updated successfully.',
    type: ProjectDomainEntity,
  })
  @ApiResponse({ status: 404, description: 'ProjectDomain not found.' })
  @Auth('projects:update-domains')
  @Patch(':projectId/domains/:id')
  updateProjectDomain(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Body() updateProjectDomainDto: UpdateProjectDomainDto,
  ) {
    return this.projectsService.updateProjectDomain(
      +projectId,
      +id,
      updateProjectDomainDto,
    );
  }

  @ApiOperation({ summary: 'Delete a ProjectDomain' })
  @ApiResponse({
    status: 200,
    description: 'ProjectDomain deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'ProjectDomain not found.' })
  @Auth('projects:delete-domains')
  @Delete(':projectId/domains/:id')
  deleteProjectDomain(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
  ) {
    return this.projectsService.deleteProjectDomain(+projectId, +id);
  }

  @ApiOperation({ summary: 'Get Project by Url' })
  @ApiResponse({ status: 200, type: ProjectEntity })
  @Auth('projects:view')
  @Get('me/by-domain')
  getProjectByUrl(@Query('domain') url: string) {
    return this.projectsService.getProjectByUrl(url);
  }

  @Auth('repo:view')
  @ApiOperation({ summary: 'Get Project Repo' })
  @ApiResponse({
    type: GithubRepoEntity,
    isArray: true,
  })
  @Get(':projectId/github/repo')
  getProjectRepos(@Param('projectId') projectId: string) {
    return this.projectsService.getProjectRepo(+projectId);
  }

  @Post(':projectId/github/repo')
  @ApiOperation({ summary: 'Create GitHub Repo' })
  @ApiResponse({
    status: 201,
    description: 'The repo has been successfully created.',
  })
  async createGithubRepo(
    @Request() { user }: LoggedUserRequest,
    @Param('projectId') projectId: string,
    @Body() createGithubRepoDto: UpdateReposDto,
  ) {
    return this.projectsService.updateGithubRepo(
      +user.id,
      +projectId,
      createGithubRepoDto.repos,
    );
  }

  @Get(':projectId/github/repo/:repoId')
  @ApiOperation({ summary: 'Get a single GitHub Repo' })
  @ApiResponse({
    status: 200,
    description: 'Returns the specified GitHub repo.',
    type: GithubRepoEntity,
  })
  async findOneGithubRepo(
    @Param('projectId') projectId: string,
    @Param('repoId') repoId: string,
  ) {
    return this.projectsService.findOneGithubRepo(+projectId, +repoId);
  }
}
