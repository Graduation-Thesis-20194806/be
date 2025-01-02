import {
  Controller,
  Logger,
  Get,
  Request,
  BadRequestException,
  Query,
  Patch,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggedUserRequest } from 'src/auth/entities/logged-user.entity';
import { UserEntity } from './entities/user.entity';
import { PaginateDto } from 'src/common/dto/paginate.dto';
import { GithubService } from 'src/github/github.service';
import { GithubRepoQueryDto } from './dto/repo-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  private logger = new Logger(UsersController.name);
  constructor(
    private usersService: UsersService,
    private githubService: GithubService,
  ) {}

  @Get('me')
  @ApiResponse({
    status: 200,
    type: UserEntity,
  })
  async getMe(@Request() { user }: LoggedUserRequest) {
    const res = await this.usersService.findOne(+user.id);
    if (res) {
      return new UserEntity(res);
    } else throw new BadRequestException();
  }

  @Get('me/github/org')
  async getGithubOrgs(
    @Request() { user }: LoggedUserRequest,
    @Query() pagination: PaginateDto,
  ) {
    const userData = await this.usersService.findOneReturnFull(+user.id);
    return this.githubService.listUserOrganizations(
      userData.githubUsername,
      userData.githubAccessToken,
      pagination.page,
    );
  }

  @ApiOperation({ summary: 'Get All Github Repo' })
  @Get('me/github/repo')
  async getGithubProjects(
    @Request() { user }: LoggedUserRequest,
    @Query() data: GithubRepoQueryDto,
  ) {
    const { page, org } = data;
    const userData = await this.usersService.findOneReturnFull(+user.id);
    if (!org) {
      return this.githubService.getUserRepos(
        userData.githubUsername,
        userData.githubAccessToken,
        page,
      );
    } else {
      return this.githubService.getOrgRepos(
        org,
        userData.githubAccessToken,
        page,
      );
    }
  }

  @ApiResponse({
    status: 200,
    type: UserEntity,
  })
  @Patch('/me')
  async updateUser(
    @Request() { user }: LoggedUserRequest,
    @Body() data: UpdateUserDto,
  ) {
    return this.usersService.updateUser(+user.id, data);
  }
}
