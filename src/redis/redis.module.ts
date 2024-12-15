import { Module } from '@nestjs/common';
import { RedisController } from './redis.controller';
import { ReportsModule } from 'src/reports/reports.module';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  controllers: [RedisController],
  imports: [ReportsModule, ProjectsModule],
})
export class RedisModule {}
