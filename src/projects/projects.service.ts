import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project';
import { Prisma, ProjectRole } from '@prisma/client';
import { ProjectQueryDto } from './dto/project-query.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { nanoid } from 'nanoid';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class ProjectsService {
  private logger = new Logger(ProjectsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
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
  async getOne(user_id: number, project_id: number) {
    return this.prismaService.project.findUnique({
      where: {
        id: project_id,
        projectMembers: {
          some: {
            userId: user_id,
          },
        },
      },
      include: {
        projectMembers: {
          select: {
            role: {
              select: {
                category: true,
                name: true,
              },
            },
            userId: true,
          },
        },
      },
    });
  }
  async getProjectRoles(user_id: number, project_id: number) {
    return this.prismaService.role.findMany({
      where: {
        projectId: project_id,
        project: {
          projectMembers: {
            some: {
              userId: user_id,
            },
          },
        },
      },
    });
  }
  async createRole(project_id: number, createDto: CreateRoleDto) {
    return this.prismaService.role.create({
      data: {
        ...createDto,
        projectId: project_id,
      },
    });
  }
  async deleteRole(project_id: number, role_id: number) {
    const res = await this.prismaService.role.delete({
      where: {
        id: role_id,
        projectId: project_id,
      },
    });
    if (!res) {
      return {
        success: false,
        message: "Can't not delete this item",
      };
    }
    return {
      success: true,
    };
  }

  async getProjectMembers(project_id: number) {
    const query: Prisma.ProjectMemberWhereInput = {
      projectId: project_id,
    };
    const [total, items] = await this.prismaService.$transaction([
      this.prismaService.projectMember.count({
        where: query,
      }),
      this.prismaService.projectMember.findMany({
        where: query,
        orderBy: {
          roleId: 'asc',
        },
        include: {
          user: true,
          role: true,
        },
      }),
    ]);
    return {
      total,
      items,
    };
  }

  async deleteMember(project_id: number, user_id: number) {
    return this.prismaService.projectMember.delete({
      where: {
        userId_projectId: {
          userId: user_id,
          projectId: project_id,
        },
      },
    });
  }

  async createInvitationLink(
    project_id: number,
    user_id: number,
    roleid: number,
  ) {
    const tokenObj = await this.prismaService.invitationToken.findUnique({
      where: {
        userId_projectId: {
          userId: user_id,
          projectId: project_id,
        },
      },
    });
    if (tokenObj)
      await this.prismaService.invitationToken.delete({
        where: {
          userId_projectId: {
            userId: user_id,
            projectId: project_id,
          },
        },
      });
    const token = nanoid();
    const res = await this.prismaService.invitationToken.create({
      data: {
        token,
        userId: user_id,
        projectId: project_id,
        roleId: roleid,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    if (res)
      return `${this.configService.get<string>('INVITATION_BASE_URL')}?projectId=${project_id}&token=${token}`;
    return undefined;
  }

  async inviteMember(project_id: number, email: string, roleid: number) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    const project = await this.prismaService.project.findUnique({
      where: { id: project_id },
    });
    if (!user) return undefined;
    const link = await this.createInvitationLink(project_id, user.id, roleid);
    if (!link) return undefined;
    await this.emailService.sendEmail(
      email,
      'Join to our team!',
      'invitation',
      {
        link: link,
        username: user.username,
        projectName: project.name,
        description: project.description,
      },
    );
    return link;
  }

  async verifyMember(project_id: number, token: string) {
    const tokenObj = await this.prismaService.invitationToken.findUnique({
      where: { token },
    });
    if (!tokenObj) return false;
    const now = Date.now();
    const expiredAt = new Date(tokenObj.expiredAt).getTime();
    await this.prismaService.invitationToken.delete({
      where: {
        id: tokenObj.id,
      },
    });
    if (now > expiredAt) {
      return false;
    }
    const role = await this.prismaService.role.findUnique({
      where: { id: tokenObj.roleId },
    });
    const res = await this.prismaService.projectMember.create({
      data: {
        userId: tokenObj.userId,
        projectId: project_id,
        roleId: role?.id,
      },
    });
    if (res) return true;
    return false;
  }
}
