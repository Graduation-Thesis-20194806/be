import { ProjectRole } from '@prisma/client';

export default {
  [ProjectRole.MEMBER]: {
    projects: ['view', 'view-domains'],
    tasks: ['add', 'update-own', 'delete-own', 'view'],
    reports: ['add', 'update-own', 'delete-own', 'view'],
    'task-comments': ['add', 'update-own', 'delete-own', 'view'],
    'report-comments': ['add', 'update-own', 'delete-own', 'view'],
  },
  [ProjectRole.GUEST]: {
    projects: ['view', 'view-domains'],
    reports: ['add', 'update-own', 'delete-own', 'view'],
    'report-comments': ['add', 'update-own', 'delete-own', 'view'],
  },
};
