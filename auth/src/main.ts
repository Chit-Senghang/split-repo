import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { GlobalExceptionFilter } from './shared-resources/exception-filter/global.exception-filter';
import { RequestContextMiddleware } from './shared-resources/middleware/request-context.middleware';
import { getProtoPath } from './shared-resources/utils/proto-utils';
import { EnvironmentEnum } from './shared-resources/common/enums/environment.enum';
// import { createNamespace } from 'node-request-context';
import * as koiHrm from './shared-resources/proto';
import { NewrelicInterceptor } from './shared-resources/common/interceptor/new-relic.interceptor';
import { AppModule } from './app.module';

dotenv.config({
  path:
    process.env.NODE_ENV === EnvironmentEnum.LOCAL
      ? `${process.cwd()}/.env`
      : `${process.cwd()}/.env`
});

const protoDir = getProtoPath(process.env.NODE_ENV);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  Logger.log(`Running On App Env ${process.env.NODE_ENV}`);
  Logger.log(`Running On App Port ${process.env.APP_PORT}`);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: koiHrm.AuthenticationProto.AUTHENTICATION_PACKAGE_NAME,
      protoPath: join(protoDir, 'authentication.proto'),
      url:
        process.env.NODE_ENV === EnvironmentEnum.LOCAL
          ? '0.0.0.0:40000'
          : 'hrm_authentication:40000'
    }
  });
  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    methods: '*'
  });

  app.use(RequestContextMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (error) => new BadRequestException(error)
    })
  );

  // disable (newrelic) running on local authentication module base env
  // eslint-disable-next-line eqeqeq
  if (process.env.NODE_ENV != EnvironmentEnum.LOCAL) {
    app.useGlobalInterceptors(new NewrelicInterceptor());
  }

  app.useGlobalFilters(new GlobalExceptionFilter());

  if (process.env.NODE_ENV !== EnvironmentEnum.PROD) {
    const config = new DocumentBuilder()
      .setTitle('Authentication API Documentation')
      .setDescription('The Authentication API description')
      .setVersion('1.0')
      .addServer(`${process.env.APP_DOMAIN}/authentication`, 'authentication')
      .addServer(`${process.env.APP_DOMAIN}/auth`, 'login')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);
  }

  await app.startAllMicroservices();
  await app.listen(process.env.APP_PORT);
}
bootstrap();
