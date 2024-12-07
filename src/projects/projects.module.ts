import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { EmailModule } from 'src/email/email.module';

@Module({
  providers: [ProjectsService],
  controllers: [ProjectsController],
  imports: [EmailModule],
})
export class ProjectsModule {}
