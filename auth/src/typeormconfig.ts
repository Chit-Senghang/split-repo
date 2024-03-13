import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';
import { EnvironmentEnum } from './shared-resources/common/enums/environment.enum';

dotenv.config({
  path:
    process.env.NODE_ENV === EnvironmentEnum.LOCAL
      ? `${process.cwd()}/apps/authentication/.env`
      : `${process.cwd()}/.env`
});

const config = new DataSource({
  migrationsTableName: 'migrations',
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'hrm_authentication',
  logging: false,
  synchronize: false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/database/**/*{.ts,.js}'],
  namingStrategy: new SnakeNamingStrategy()
});

config.initialize();

export default config;
