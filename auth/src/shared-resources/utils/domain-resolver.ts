import { join } from 'path';
import * as dotenv from 'dotenv';
import { AppEnvEnum } from '../ts/enum/app-env.enum';

dotenv.config({
  path: `${process.cwd()}/apps/employee/.env`
});

const getBackofficeResetUrl = (): string => {
  const http: string =
    process.env.APP_ENV === AppEnvEnum.LOCAL ? 'http://' : 'https://';
  const backofficeDomain: string = process.env.BO_DOMAIN;
  return http + join(backofficeDomain, '#/auth/verify');
};

export { getBackofficeResetUrl };
