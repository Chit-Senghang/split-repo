import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { getAccessToken } from '../../../test/common/common.e2e.service';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';
import { CompanyStructureTypeEnum } from '../../../apps/employee/src/company-structure/common/ts/enum/structure-type.enum';

const createComponent = async (
  name: string,
  type: CompanyStructureTypeEnum
): Promise<number> => {
  const accessToken = await getAccessToken();
  const response = await request(API_ENDPOINT)
    .post('/employee/company-structure-component')
    .send({ name, type })
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    })
    .expect(HttpStatus.CREATED);
  return response.body.data.id;
};

export { createComponent };
