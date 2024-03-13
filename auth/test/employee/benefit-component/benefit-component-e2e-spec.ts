import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus } from '@nestjs/common';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import { getAccessToken } from '../../common/common.e2e.service';
import { createBenefitComponentType } from '../benefit-component-type/benefit-component-type.e2e-spec-service';
import { baseSalaryType } from './benefit-component-e2e-spec-service';

describe('BenefitComponentTest', () => {
  let accessToken: string;
  let name: string;
  let nameKhmer: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  it('Test create benefit component', async () => {
    let benefitComponentTypeId = await createBenefitComponentType(accessToken);
    const baseSalary = await baseSalaryType(accessToken);

    name = uuidv4();
    nameKhmer = uuidv4();
    await request(API_ENDPOINT)
      .post(`/employee/benefit-component`)
      .send({ name, nameKhmer, benefitComponentTypeId: baseSalary.id })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(async (err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `You are not allow to create data under type BASE SALARY.`
        );
      });

    // create
    name = uuidv4();
    nameKhmer = uuidv4();
    const res = await request(API_ENDPOINT)
      .post(`/employee/benefit-component`)
      .send({ name, nameKhmer, benefitComponentTypeId })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(async (res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    const id = res.body.data.id;

    // create duplicate
    await request(API_ENDPOINT)
      .post(`/employee/benefit-component`)
      .send({ name, nameKhmer, benefitComponentTypeId })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(`Data already exist.`);
      })
      .expect(HttpStatus.CONFLICT);

    // get one
    await request(API_ENDPOINT)
      .get(`/employee/benefit-component/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(async (res) => {
        expect(res.body.data).toMatchObject({
          name,
          benefitComponentType: { id: benefitComponentTypeId }
        });
      })
      .expect(HttpStatus.OK);

    // get all
    await request(API_ENDPOINT)
      .get(`/employee/benefit-component`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      })
      .expect(HttpStatus.OK);

    // update
    name = uuidv4();
    nameKhmer = uuidv4();
    benefitComponentTypeId = await createBenefitComponentType(accessToken);
    await request(API_ENDPOINT)
      .patch(`/employee/benefit-component/${id}`)
      .send({ name, nameKhmer, benefitComponentTypeId })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(async (res) => {
        expect(res.body.data.id).toEqual(id);
      })
      .expect(HttpStatus.OK);

    // get one after update
    await request(API_ENDPOINT)
      .get(`/employee/benefit-component/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(async (res) => {
        expect(res.body.data).toMatchObject({
          name,
          benefitComponentType: { id: benefitComponentTypeId }
        });
      })
      .expect(HttpStatus.OK);

    // delete
    await request(API_ENDPOINT)
      .delete(`/employee/benefit-component/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NO_CONTENT);

    // get one after delete
    await request(API_ENDPOINT)
      .get(`/employee/benefit-component/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('Test add isFixed in benefit component', async () => {
    const benefitComponentTypeId =
      await createBenefitComponentType(accessToken);

    // create one
    name = uuidv4();
    nameKhmer = uuidv4();
    const res = await request(API_ENDPOINT)
      .post(`/employee/benefit-component`)
      .send({ name, nameKhmer, benefitComponentTypeId })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(async (res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    // get one
    const componentId: number = res.body.data.id;
    await request(API_ENDPOINT)
      .get(`/employee/benefit-component/${componentId}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(async (res) => {
        expect(res.body.data.isFixed).toBe(false);
      })
      .expect(HttpStatus.OK);

    // get all
    await request(API_ENDPOINT)
      .get(`/employee/benefit-component`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(async (res) => {
        const benefitComponent = res.body.data.filter(
          (item: { name: string }) => item.name === 'BASE SALARY'
        );
        expect(benefitComponent[0].isFixed).toBe(true);
      })
      .expect(HttpStatus.OK);
  });
});
