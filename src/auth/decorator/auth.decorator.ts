import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guard/jwt-guard.guard';
import { RolesGuard } from '../guard/roles.guard';
import { Permissions } from './roles.decorator';

export function Auth(...permissions: string[]) {
  return applyDecorators(
    Permissions(...permissions),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
  );
}
