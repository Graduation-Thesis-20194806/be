import { Prisma } from '@prisma/client';

export interface PrismaServiceOptions {
  prismaOptions?: Prisma.PrismaClientOptions;

  explicitConnect?: boolean;

  middlewares?: Array<Prisma.Middleware>;
}
