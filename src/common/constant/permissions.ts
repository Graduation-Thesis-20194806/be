import { ProjectRole } from '@prisma/client';

export default {
  [ProjectRole.MEMBER]: {
    tasks: ['add', 'update-own', 'delete-own', 'view'],
    reports: ['add', 'update-own', 'delete-own', 'view'],
    'task-comments': ['add', 'update-own', 'delete-own', 'view'],
    'report-comments': ['add', 'update-own', 'delete-own', 'view'],
  },
  [ProjectRole.GUEST]: {
    reports: ['add', 'update-own', 'delete-own', 'view'],
    'report-comments': ['add', 'update-own', 'delete-own', 'view'],
  },
};
