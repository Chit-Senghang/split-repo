import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { WorkShiftTypeEnum } from '../../../apps/employee/src/workshift-type/common/ts/enum/workshift-type.enum';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';

const getWorkshiftTypeByName = async (
  accessToken: string,
  workshiftTypeEnum: WorkShiftTypeEnum
) => {
  const response = await request(API_ENDPOINT)
    .get('/employee/workshift-type')
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK);

  const workshiftType =
    response.body.data[0].name === workshiftTypeEnum
      ? response.body.data[0]
      : response.body.data[1];
  return workshiftType;
};

export { getWorkshiftTypeByName };
