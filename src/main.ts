import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './common/filter/prisma-client-exception.filter';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const logger = new Logger('main');
  logger.log('bootstrap with env:: ' + process.env.NODE_ENV);
  const loglevels: LogLevel[] = ['log', 'error', 'warn'];
  if (process.env.NODE_ENV === 'development') {
    loglevels.push('debug', 'verbose');
  }

  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    logger: loglevels,
  });
  const configService = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: configService.get<string>('REDIS_HOST') ?? 'localhost',
      port: configService.get<number>('REDIS_PORT') ?? 6379,
    },
  });

  await app.startAllMicroservices();

  app.enableCors({
    origin: '*',
    allowedHeaders: '*',
    credentials: false,
  });
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.use('/webhook/github', bodyParser.raw({ type: '*/*' }));
  if (configService.get<boolean>('ENABLE_SWAGGER')) {
    const swgConfig = new DocumentBuilder()
      .setTitle('THESIS')
      .setDescription('The API')
      .setVersion('1.0')
      .addSecurityRequirements('bearer')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swgConfig);
    SwaggerModule.setup('/docs', app, document);
    const env = configService.get<string>('NODE_ENV');
    if (env === 'development') {
      import('fs').then((fs) => {
        import('prettier').then(async (prettier) => {
          fs.writeFileSync(
            'swagger.json',
            await prettier.format(JSON.stringify(document), {
              parser: 'json',
            }),
          );
        });
      });
    }
  }

  const port = configService.get<number>('PORT');
  await app.listen(port);
  logger.log(
    `app running on PORT: ${port} - with ENV: ${configService.get<string>(
      'NODE_ENV',
    )}`,
  );
}
bootstrap();
