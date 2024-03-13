import { join } from 'path';
import { EnvironmentEnum } from '../common/enums/environment.enum';

export const getProtoPath = (appEnv: string | undefined) => {
  return join(
    process.cwd(),
    appEnv === EnvironmentEnum.LOCAL
      ? 'src/shared-resources/proto'
      : 'dist/shared-resources/proto'
  );
};
