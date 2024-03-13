import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus } from '@nestjs/common';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';

// get benefit component type
export const createBenefitComponentType = async (
  accessToken: string
): Promise<number> => {
  const name = uuidv4();
  const taxPercentage = 0;

  const res = await request(API_ENDPOINT)
    .post('/employee/benefit-component-type')
    .send({ name, taxPercentage })
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    })
    .expect(HttpStatus.CREATED);

  return res.body.data.id;
};
