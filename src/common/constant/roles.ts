import { ProjectRole } from '@prisma/client';

export const RoleOwner = 'OWNER';
export type RoleOwner = typeof RoleOwner;
export type SystemProjectRole = ProjectRole | RoleOwner;
