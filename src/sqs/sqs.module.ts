// src/sqs/sqs.module.ts

import { Module } from '@nestjs/common';
import { SqsService } from './sqs.service';
import { ReportsModule } from 'src/reports/reports.module';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  providers: [SqsService],
  exports: [SqsService],
  imports: [ReportsModule, ProjectsModule],
})
export class SqsModule {}
