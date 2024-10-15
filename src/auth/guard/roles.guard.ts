import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import permissions from 'src/common/constant/permissions';
import { ProjectRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    if (!requiredPermissions) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const regex = /^\/projects\/\d+(\/.*)?$/;
    if (regex.test(request.url) && request.params.projectid) {
      const user = request.user;
      const { projectid } = request.params;
      const userRole = await this.prisma.projectMember.findFirst({
        where: {
          userId: +user.id,
          projectId: +projectid,
        },
        include: {
          project: true,
          role: true,
        },
      });
      if (!userRole) return false;
      const role = userRole.role.category;
      if (role === ProjectRole.OWNER) return true;
      const rolePermissons = permissions[role];
      if (!rolePermissons) return false;
      for (const permission of Object.keys(rolePermissons)) {
        if (!Array.isArray(rolePermissons[permission])) continue;
        for (const per of rolePermissons[permission]) {
          if (requiredPermissions.includes(`${permission}:${per}`)) return true;
        }
      }
      return false;
    }
    return true;
  }
}
