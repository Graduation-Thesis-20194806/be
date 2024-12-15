import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project';
import { Prisma, ProjectRole, ReportIssueType } from '@prisma/client';
import { ProjectQueryDto } from './dto/project-query.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { nanoid } from 'nanoid';
import { EmailService } from 'src/email/email.service';
import { CreateProjectStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { AssignIssueTypeDto } from './dto/assign-issue-type.dto';
import { UpdateAssignDto } from './dto/update-assign.dto';

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

  async createStatus(projectid: number, data: CreateProjectStatusDto) {
    return this.prismaService.status.create({
      data: {
        ...data,
        projectId: projectid,
      },
    });
  }

  async findAllStatus(projectid: number) {
    return this.prismaService.status.findMany({
      where: {
        projectId: projectid,
      },
    });
  }

  async findOneStatus(projectid: number, id: number) {
    const status = await this.prismaService.status.findUnique({
      where: { projectId: projectid, id },
    });
    if (!status) {
      throw new NotFoundException(`Status with ID ${id} not found`);
    }
    return status;
  }

  async updateStatus(projectid: number, id: number, data: UpdateStatusDto) {
    await this.findOneStatus(projectid, id);
    return this.prismaService.status.update({
      where: { id },
      data,
    });
  }

  async removeStatus(projectid: number, id: number) {
    await this.findOneStatus(projectid, id);
    return this.prismaService.status.delete({
      where: { id },
    });
  }

  async createCategory(projectid: number, data: CreateCategoryDto) {
    return this.prismaService.category.create({
      data: {
        ...data,
        projectId: projectid,
      },
    });
  }

  async findAllCategory(projectid: number) {
    return this.prismaService.category.findMany({
      where: {
        projectId: projectid,
      },
    });
  }

  async findOneCategory(projectId: number, id: number) {
    const category = await this.prismaService.category.findUnique({
      where: { projectId, id },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async updateCategory(projectId: number, id: number, data: UpdateCategoryDto) {
    await this.findOneCategory(projectId, id);
    return this.prismaService.category.update({ where: { id }, data });
  }

  async removeCategory(projectId: number, id: number) {
    await this.findOneCategory(projectId, id);
    return this.prismaService.category.delete({ where: { id } });
  }

  async createPhase(projectId: number, data: CreatePhaseDto) {
    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return this.prismaService.phase.create({
      data: {
        ...data,
        projectId,
      },
    });
  }

  async findAllPhases(projectId: number) {
    return this.prismaService.phase.findMany({
      where: { projectId },
    });
  }

  async findOnePhase(projectId: number, phaseId: number) {
    const phase = await this.prismaService.phase.findFirst({
      where: { id: phaseId, projectId },
    });
    if (!phase) {
      throw new NotFoundException(
        `Phase with ID ${phaseId} not found in Project ${projectId}`,
      );
    }
    return phase;
  }

  async updatePhase(projectId: number, phaseId: number, data: UpdatePhaseDto) {
    const existing = await this.prismaService.phase.findFirst({
      where: { id: phaseId, projectId },
    });
    if (!existing) {
      throw new NotFoundException(
        `Phase with ID ${phaseId} not found in Project ${projectId}`,
      );
    }

    return this.prismaService.phase.update({
      where: { id: phaseId },
      data,
    });
  }

  async removePhase(projectId: number, phaseId: number) {
    const existing = await this.prismaService.phase.findFirst({
      where: { id: phaseId, projectId },
    });
    if (!existing) {
      throw new NotFoundException(
        `Phase with ID ${phaseId} not found in Project ${projectId}`,
      );
    }

    return this.prismaService.phase.delete({
      where: { id: phaseId },
    });
  }

  async assignIssueType(projectId: number, dto: AssignIssueTypeDto) {
    const member = await this.prismaService.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: dto.userId,
          projectId: projectId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('ProjectMember not found in this project');
    }
    const existingAssign = await this.prismaService.autoAssign.findFirst({
      where: {
        assignedTo: member.id,
        issueType: dto.issueType,
      },
    });

    if (!existingAssign) {
      await this.prismaService.autoAssign.create({
        data: {
          assignedTo: member.id,
          issueType: dto.issueType,
        },
      });
    }

    return {
      message: `Assigned ${dto.issueType} to user ${dto.userId} in project ${projectId}`,
    };
  }

  async getAssigns(projectId: number) {
    // Get all ProjectMembers of this project
    const members = await this.prismaService.projectMember.findMany({
      where: { projectId },
      include: {
        AutoAssign: {
          include: {
            Assignee: {
              include: {
                user: {
                  select: {
                    username: true,
                    avatar: true,
                    id: true,
                  },
                },
                role: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Collect all AutoAssign records
    const allAssigns = members.flatMap((m) => m.AutoAssign);
    return allAssigns;
  }

  async getAssignById(projectId: number, assignId: number) {
    const assign = await this.prismaService.autoAssign.findUnique({
      where: { id: assignId },
      include: {
        Assignee: {
          include: {
            user: true,
            project: true,
          },
        },
      },
    });

    if (!assign || assign.Assignee.projectId !== projectId) {
      throw new NotFoundException('Assign not found in this project');
    }

    return assign;
  }

  async getAssignByIssueType(projectId: number, issueType: ReportIssueType) {
    return this.prismaService.autoAssign.findFirst({
      where: {
        Assignee: {
          projectId: projectId,
        },
        issueType,
      },
      include: {
        Assignee: {
          select: {
            userId: true,
          },
        },
      },
    });
  }

  async updateAssign(
    projectId: number,
    assignId: number,
    dto: UpdateAssignDto,
  ) {
    const assign = await this.prismaService.autoAssign.findUnique({
      where: { id: assignId },
      include: { Assignee: true },
    });

    const member = await this.prismaService.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: dto.userId,
          projectId: projectId,
        },
      },
    });

    if (!assign || assign.Assignee?.projectId !== projectId) {
      throw new NotFoundException('Assign not found in this project');
    }

    const updated = await this.prismaService.autoAssign.update({
      where: { id: assignId },
      data: {
        issueType: dto.issueType,
        assignedTo: member.id,
      },
    });

    return updated;
  }

  async deleteAssign(projectId: number, assignId: number) {
    const assign = await this.prismaService.autoAssign.findUnique({
      where: { id: assignId },
      include: { Assignee: true },
    });

    if (!assign || assign.Assignee?.projectId !== projectId) {
      throw new NotFoundException('Assign not found in this project');
    }

    await this.prismaService.autoAssign.delete({ where: { id: assignId } });
    return { message: `Deleted assign ${assignId}` };
  }
}
