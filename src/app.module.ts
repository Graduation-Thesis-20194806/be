import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './auth/guard/jwt-guard.guard';
import { APP_GUARD } from '@nestjs/core';
import { JsonBodyMiddleware } from './common/filter/json-body.middleware';
import { AppController } from './app.controller';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { RolesGuard } from './auth/guard/roles.guard';
import { prismaLoggerMiddleware } from './prisma/prisma.logging.middleware';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { ReportsModule } from './reports/reports.module';
import { FilesModule } from './files/files.module';
import { ReportCommentsModule } from './report-comments/report-comments.module';
import { EmailModule } from './email/email.module';
import { CommentsModule } from './comments/comments.module';
import { StatisticController } from './statistic/statistic.controller';
import { StatisticModule } from './statistic/statistic.module';
import { RedisController } from './redis/redis/redis.controller';
import { RedisModule } from './redis/redis.module';
// Import các module khác

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validationOptions: {
        allowUnknow: false,
        abortEarly: true,
      },
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3001),
        ENABLE_SWAGGER: Joi.boolean().default(false),
        JWT_ACCESS_SECRET: Joi.string(),
        JWT_ACCESS_EXPIRES_IN: Joi.string().default('5m'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('1d'),
        REGISTER_TOKEN_EXPIRES_IN: Joi.string().default('1d'),
        SALT_ROUND: Joi.number().default(10),
      }),
    }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [prismaLoggerMiddleware()],
        prismaOptions: {
          log: ['error', 'warn'],
        },
        explicitConnect: true,
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    PrismaModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    ReportsModule,
    FilesModule,
    ReportCommentsModule,
    EmailModule,
    CommentsModule,
    StatisticModule,
    RedisModule,
    // Các module khác
  ],
  controllers: [AppController, StatisticController, RedisController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JsonBodyMiddleware).forRoutes('*');
  }
}
