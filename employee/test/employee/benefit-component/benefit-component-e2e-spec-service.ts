import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';

const baseSalaryType = async (accessToken: string) => {
  const response = await request(API_ENDPOINT)
    .get('/employee/benefit-component-type')
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK);

  const baseSalaryType = response.body.data.find(
    (item: any) => item.name === 'BASE SALARY'
  );

  return baseSalaryType;
};

const createBenefitComponent = async (
  accessToken: string,
  benefitComponentTypeId: number
) => {
  const name = uuidv4();
  const response = await request(API_ENDPOINT)
    .post(`/employee/benefit-component`)
    .send({ name, benefitComponentTypeId })
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(async (res) => {
      expect(res.body.data.id).not.toBeNull();
    })
    .expect(HttpStatus.CREATED);

  return response.body.data.id;
};

export { baseSalaryType, createBenefitComponent };
