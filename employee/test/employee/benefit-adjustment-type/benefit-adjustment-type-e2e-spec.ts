import { v4 as uuidv4 } from 'uuid';
import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { BenefitAdjustmentType } from '../../../apps/employee/src/benefit-adjustment-type/entities/benefit-adjustment-type.entity';
import { getAccessToken } from '../../../test/common/common.e2e.service';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';
import { CreateBenefitAdjustmentTypeDto } from '../../../apps/employee/src/benefit-adjustment-type/dto/create-benefit-adjustment-type.dto';

describe('Test Benefit Adjustment Type', () => {
  let accessToken: string;
  beforeAll(async () => {
    accessToken = await getAccessToken();
  });
  describe('Test Create', () => {
    it('Create', async () => {
      //CASE: create success
      const name = uuidv4();
      const benefitAdjustmentTypeDto: CreateBenefitAdjustmentTypeDto = {
        name
      };
      const response = await request(API_ENDPOINT)
        .post('/employee/benefit-adjustment-type')
        .send(benefitAdjustmentTypeDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CREATED);

      //CASE: get one after create
      await request(API_ENDPOINT)
        .get(`/employee/benefit-adjustment-type/${response.body.data.id}`)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.data.id).toEqual(response.body.data.id);
          expect(res.body.data.name).toEqual(benefitAdjustmentTypeDto.name);
        });

      //CASE: create with duplicate name
      await request(API_ENDPOINT)
        .post('/employee/benefit-adjustment-type')
        .send(benefitAdjustmentTypeDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CONFLICT)
        .expect((res) => {
          expect(res.body.errors[0].message).toContain('Data already exist.');
          expect(res.body.errors[0].path).toContain('name');
        });
    });
  });

  describe('Test Update, Get and Delete cases', () => {
    it('Update, Get and Delete', async () => {
      //CASE: get all
      const responses = await request(API_ENDPOINT)
        .get('/employee/benefit-adjustment-type')
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.OK)
        .expect((res) => expect(res.body.data.length).toBeGreaterThan(0));

      //get record that is system defined
      const benefitAdjustmentTypeSystemDefined: BenefitAdjustmentType =
        responses.body.data.find(
          (benefitAdjustmentType: BenefitAdjustmentType) =>
            benefitAdjustmentType.isSystemDefined
        );

      //CASE: update record that is system defined
      const benefitAdjustmentTypeDto: CreateBenefitAdjustmentTypeDto = {
        name: uuidv4()
      };

      await request(API_ENDPOINT)
        .patch(
          `/employee/benefit-adjustment-type/${benefitAdjustmentTypeSystemDefined.id}`
        )
        .send(benefitAdjustmentTypeDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.FORBIDDEN)
        .expect((res) =>
          expect(res.body.errors[0].message).toContain(
            'No modification is allowed due to system defined.'
          )
        );

      //get record with system defined = false
      const benefitAdjustmentNotSystemDefined: BenefitAdjustmentType =
        responses.body.data.find(
          (benefitAdjustmentType: BenefitAdjustmentType) =>
            !benefitAdjustmentType.isSystemDefined
        );

      //CASE: update success
      await request(API_ENDPOINT)
        .patch(
          `/employee/benefit-adjustment-type/${benefitAdjustmentNotSystemDefined.id}`
        )
        .send(benefitAdjustmentTypeDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.OK);

      //CASE: delete system defined record
      await request(API_ENDPOINT)
        .delete(
          `/employee/benefit-adjustment-type/${benefitAdjustmentTypeSystemDefined.id}`
        )
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.FORBIDDEN)
        .expect((res) =>
          expect(res.body.errors[0].message).toContain(
            'No modification is allowed due to system defined.'
          )
        );

      //CASE: delete success
      await request(API_ENDPOINT)
        .delete(
          `/employee/benefit-adjustment-type/${benefitAdjustmentNotSystemDefined.id}`
        )
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.NO_CONTENT);

      //CASE: get one after delete
      await request(API_ENDPOINT)
        .get(
          `/employee/benefit-adjustment-type/${benefitAdjustmentNotSystemDefined.id}`
        )
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) =>
          expect(res.body.errors[0].message).toContain(
            `Resource benefit adjustment type of ${benefitAdjustmentNotSystemDefined.id} not found`
          )
        );

      //CASE: get all with search by keywords
      await request(API_ENDPOINT)
        .get(
          `/employee/benefit-adjustment-type?keywords=${benefitAdjustmentTypeSystemDefined.name}`
        )
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.OK)
        .expect((res) =>
          expect(res.body.data[0].name).toContain(
            benefitAdjustmentTypeSystemDefined.name
          )
        );
    });
  });
});
