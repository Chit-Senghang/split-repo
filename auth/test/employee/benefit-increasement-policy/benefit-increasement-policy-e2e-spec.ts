import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { getAccessToken } from '../../common/common.e2e.service';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';

describe('TestBenefitIncreasementPolicy', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  it('CreateBenefitIncreasementPolicy', async () => {
    let name = uuidv4();
    const benefitComponentId = await createBenefitComponent();
    const response = await request(API_ENDPOINT)
      .post('/employee/benefit-increasement-policy')
      .send({
        name,
        detail: [
          {
            benefitComponentId,
            increasementAmount: 1000
          }
        ]
      })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    // create with duplicate name
    await request(API_ENDPOINT)
      .post('/employee/benefit-increasement-policy')
      .send({
        name,
        detail: [
          {
            benefitComponentId,
            increasementAmount: 1000
          }
        ]
      })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0]).toMatchObject({
          path: 'name',
          message: 'Data already exist.'
        });
      })
      .expect(HttpStatus.CONFLICT);

    const benefitIncreasementPolicyId = response.body.data.id;
    //get one
    await request(API_ENDPOINT)
      .get(
        `/employee/benefit-increasement-policy/${benefitIncreasementPolicyId}`
      )
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.OK);

    //update
    name = uuidv4();
    await request(API_ENDPOINT)
      .put(
        `/employee/benefit-increasement-policy/${benefitIncreasementPolicyId}`
      )
      .send({
        name,
        detail: [{ benefitComponentId, increasementAmount: 15.9 }]
      })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data?.id).not.toBeNull();
      })
      .expect(HttpStatus.OK);

    //update to duplicate detail
    await request(API_ENDPOINT)
      .put(
        `/employee/benefit-increasement-policy/${benefitIncreasementPolicyId}`
      )
      .send({
        name,
        detail: [
          { benefitComponentId, increasementAmount: 15.9 },
          { benefitComponentId, increasementAmount: 15.9 }
        ]
      })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toMatch('Data already exist.');
      })
      .expect(HttpStatus.CONFLICT);

    //delete
    await request(API_ENDPOINT)
      .delete(
        `/employee/benefit-increasement-policy/${benefitIncreasementPolicyId}`
      )
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NO_CONTENT);

    //get one after delete
    await request(API_ENDPOINT)
      .get(
        `/employee/benefit-increasement-policy/${benefitIncreasementPolicyId}`
      )
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NOT_FOUND);
  });

  const createBenefitComponentType = async () => {
    const name = uuidv4();
    const response = await request(API_ENDPOINT)
      .post('/employee/benefit-component-type')
      .send({ name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    return response.body.data.id;
  };

  const createBenefitComponent = async () => {
    const name = uuidv4();
    const nameKhmer = uuidv4();
    const benefitComponentTypeId = await createBenefitComponentType();
    const response = await request(API_ENDPOINT)
      .post('/employee/benefit-component')
      .send({ name, nameKhmer, benefitComponentTypeId })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    return response.body.data.id;
  };
});
