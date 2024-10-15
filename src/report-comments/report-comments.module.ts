import { Module } from '@nestjs/common';
import { ReportCommentsService } from './report-comments.service';
import { ReportCommentsController } from './report-comments.controller';

@Module({
  providers: [ReportCommentsService],
  controllers: [ReportCommentsController]
})
export class ReportCommentsModule {}
