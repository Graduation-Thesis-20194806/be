import { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { PrismaModuleOptions } from './interface';
import { PRISMA_SERVICE_OPTIONS } from './prisma.constants';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {
  static forRoot(option: PrismaModuleOptions = {}): DynamicModule {
    return {
      global: option.isGlobal,
      module: PrismaModule,
      providers: [
        {
          provide: PRISMA_SERVICE_OPTIONS,
          useValue: option.prismaServiceOptions,
        },
      ],
    };
  }
}
