import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { EmailModule } from 'src/email/email.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [ProjectsService],
  controllers: [ProjectsController],
  imports: [EmailModule, UsersModule],
  exports: [ProjectsService],
})
export class ProjectsModule {}
