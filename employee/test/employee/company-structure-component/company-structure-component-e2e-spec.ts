import { v4 as uuidv4 } from 'uuid';
import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { getAccessToken } from '../../common/common.e2e.service';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import { CompanyStructureTypeEnum } from '../../../apps/employee/src/company-structure/common/ts/enum/structure-type.enum';

describe('CompanyStructureComponentTes', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  it('Test create company structure component', async () => {
    let name = uuidv4();
    let type = CompanyStructureTypeEnum.POSITION;

    const response = await request(API_ENDPOINT)
      .post('/employee/company-structure-component')
      .send({ name, type })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    // duplicate create
    await request(API_ENDPOINT)
      .post('/employee/company-structure-component')
      .send({ name, type })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(`Data already exist.`);
      })
      .expect(HttpStatus.CONFLICT);

    const id = response.body.data.id;

    await request(API_ENDPOINT)
      .get(`/employee/company-structure-component/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({
          name,
          type
        });
      })
      .expect(HttpStatus.OK);

    // update
    name = uuidv4();
    type = CompanyStructureTypeEnum.TEAM;
    await request(API_ENDPOINT)
      .put(`/employee/company-structure-component/${id}`)
      .send({ name, type })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(id);
      })
      .expect(HttpStatus.OK);

    // get all
    await request(API_ENDPOINT)
      .get(`/employee/company-structure-component?limit=10`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      })
      .expect(HttpStatus.OK);

    // delete
    await request(API_ENDPOINT)
      .delete(`/employee/company-structure-component/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NO_CONTENT);

    // get one after delete
    await request(API_ENDPOINT)
      .get(`/employee/company-structure-component/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NOT_FOUND);
  });
});
