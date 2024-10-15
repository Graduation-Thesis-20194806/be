import { PrismaServiceOptions } from './prisma-service-options.interface';

export class PrismaModuleOptions {
  isGlobal?: boolean;
  prismaServiceOptions?: PrismaServiceOptions;
}
