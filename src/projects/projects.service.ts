import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project';
import { ProjectRole } from '@prisma/client';
import { ProjectQueryDto } from './dto/project-query.dto';

@Injectable()
export class ProjectsService {
  private logger = new Logger(ProjectsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createProject(user_id: number, createProjectDto: CreateProjectDto) {
    const project = await this.prismaService.project.create({
      data: { ...createProjectDto },
    });
    const role = await this.prismaService.role.create({
      data: {
        projectId: project.id,
        name: 'Project Owner',
        category: ProjectRole.OWNER,
      },
    });
    await this.prismaService.projectMember.create({
      data: {
        projectId: project.id,
        userId: user_id,
        roleId: role.id,
      },
    });

    return project;
  }

  async findManyOwn(user_id: number, projectQueryDto: ProjectQueryDto) {
    const { page, pageSize } = projectQueryDto;
    const query = {
      projectMembers: {
        some: {
          userId: user_id,
        },
      },
    };
    const [total, items] = await this.prismaService.$transaction([
      this.prismaService.project.count({
        where: query,
      }),
      this.prismaService.project.findMany({
        where: query,
        select: {
          projectMembers: {
            where: {
              role: {
                category: ProjectRole.OWNER,
              },
              userId: user_id,
            },
            select: {
              role: {
                select: {
                  category: true,
                  name: true,
                },
              },
            },
          },
          name: true,
          description: true,
          projectThumbnail: true,
          createdAt: true,
          updatedAt: true,
          id: true,
        },
        take: pageSize,

        skip: pageSize * (page - 1),
      }),
    ]);
    return {
      total,
      items,
    };
  }
}
