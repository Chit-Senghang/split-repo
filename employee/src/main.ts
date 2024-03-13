import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as dotenv from 'dotenv';
import { RequestContextMiddleware } from './shared-resources/middleware/request-context.middleware';
import { getProtoPath } from './shared-resources/utils/proto-utils';
import { EnvironmentEnum } from './shared-resources/common/enums/environment.enum';
import * as koiHrm from './shared-resources/proto';
// import { NewrelicInterceptor } from './shared-resources/common/interceptor/new-relic.interceptor';
import { GlobalExceptionFilter } from './shared-resources/exception-filter/global.exception-filter';
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
  app.useWebSocketAdapter(new IoAdapter(app));
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: koiHrm.EmployeeProto.EMPLOYEE_PACKAGE_NAME,
      protoPath: join(protoDir, 'employee.proto'),
      url:
        process.env.NODE_ENV === EnvironmentEnum.LOCAL
          ? '0.0.0.0:50000'
          : 'hrm_employee:50000'
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

  // disable (newrelic) running on local employee module base env
  // eslint-disable-next-line eqeqeq
  // if (process.env.NODE_ENV != EnvironmentEnum.LOCAL) {
  //   app.useGlobalInterceptors(new NewrelicInterceptor());
  // }

  app.useGlobalFilters(new GlobalExceptionFilter());

  if (process.env.NODE_ENV !== EnvironmentEnum.PROD) {
    const config = new DocumentBuilder()
      .setTitle('Employee API Documentation')
      .setDescription('The Employee API description')
      .setVersion('1.0')
      .addServer(`${process.env.APP_DOMAIN}/employee`)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document, {
      swaggerOptions: {
        persistAuthorization: true
      }
    });
  }

  await app.startAllMicroservices();
  await app.listen(process.env.APP_PORT);
}

bootstrap();
