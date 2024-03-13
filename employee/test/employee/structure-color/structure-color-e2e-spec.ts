import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus } from '@nestjs/common';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import { getAccessToken } from '../../common/common.e2e.service';

describe('StructureColorTest', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  it('Test create structure color', async () => {
    const name = uuidv4();
    await request(API_ENDPOINT)
      .post('/employee/code-value?code=COMPANY_STRUCTURE_COMPONENT_COLOR')
      .send({ value: name, isEnabled: true })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `You cannot create company structure components color`
        );
      })
      .expect(HttpStatus.CONFLICT);

    const response = await request(API_ENDPOINT)
      .get(
        '/employee/code-value?code=COMPANY_STRUCTURE_COMPONENT_COLOR&limit=10'
      )
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      })
      .expect(HttpStatus.OK);

    const id = response.body.data[0].id;

    let newName = response.body.data[0].value;

    // get one
    await request(API_ENDPOINT)
      .get(`/employee/code-value/${id}?code=COMPANY_STRUCTURE_COMPONENT_COLOR`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({
          value: newName,
          isEnabled: true,
          isSystemDefined: false,
          codeId: {
            code: 'COMPANY_STRUCTURE_COMPONENT_COLOR'
          }
        });
      })
      .expect(HttpStatus.OK);

    // update name
    newName = uuidv4();
    await request(API_ENDPOINT)
      .patch(
        `/employee/code-value/${id}?code=COMPANY_STRUCTURE_COMPONENT_COLOR`
      )
      .send({ value: newName })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(id);
      })
      .expect(HttpStatus.OK);

    // get one
    await request(API_ENDPOINT)
      .get(`/employee/code-value/${id}?code=COMPANY_STRUCTURE_COMPONENT_COLOR`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({
          value: newName,
          isEnabled: true,
          isSystemDefined: false,
          codeId: {
            code: 'COMPANY_STRUCTURE_COMPONENT_COLOR'
          }
        });
      })
      .expect(HttpStatus.OK);

    // delete
    await request(API_ENDPOINT)
      .delete(
        `/employee/code-value/${id}?code=COMPANY_STRUCTURE_COMPONENT_COLOR`
      )
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `You cannot delete company structure components color`
        );
      })
      .expect(HttpStatus.CONFLICT);

    // get one after delete
    await request(API_ENDPOINT)
      .get(`/employee/code-value/${id}?code=COMPANY_STRUCTURE_COMPONENT_COLOR`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(id);
      })
      .expect(HttpStatus.OK);
  });
});
