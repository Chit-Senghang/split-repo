import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentEnum } from '../shared-resources/common/enums/environment.enum';
import { EnvironmentService } from './environment.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === EnvironmentEnum.LOCAL
          ? `${process.cwd()}/apps/authentication/.env`
          : `${process.cwd()}/.env`
    })
  ],
  providers: [EnvironmentService],
  exports: [EnvironmentService]
})
export class EnvironmentModule {}
