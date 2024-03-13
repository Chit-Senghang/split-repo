import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus } from '@nestjs/common';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import { getAccessToken } from '../../common/common.e2e.service';

describe('CodeValueTest', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  it('Test get nationality', async () => {
    await request(API_ENDPOINT)
      .get('/employee/code-value?code=NATIONALITY&limit=10')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      })
      .expect(HttpStatus.OK);
  });

  it('Test create relationship with system defined', async () => {
    const name = uuidv4();
    const response = await request(API_ENDPOINT)
      .post('/employee/code-value?code=RELATIONSHIP')
      .send({ value: name, isSystemDefined: true })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    const id = response.body.data.id;
    // get one
    await request(API_ENDPOINT)
      .get(`/employee/code-value/${id}?code=RELATIONSHIP`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({
          value: name,
          isEnabled: true,
          isSystemDefined: false,
          codeId: {
            code: 'RELATIONSHIP'
          }
        });
      })
      .expect(HttpStatus.OK);
  });

  it('Test create relationship', async () => {
    let name = uuidv4();
    const response = await request(API_ENDPOINT)
      .post('/employee/code-value?code=RELATIONSHIP')
      .send({ value: name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    const id = response.body.data.id;

    // get one
    await request(API_ENDPOINT)
      .get(`/employee/code-value/${id}?code=RELATIONSHIP`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({
          value: name,
          isEnabled: true,
          isSystemDefined: false,
          codeId: {
            code: 'RELATIONSHIP'
          }
        });
      })
      .expect(HttpStatus.OK);

    // update
    name = uuidv4();
    await request(API_ENDPOINT)
      .patch(`/employee/code-value/${id}?code=RELATIONSHIP`)
      .send({ value: name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(id);
      })
      .expect(HttpStatus.OK);

    // get one
    await request(API_ENDPOINT)
      .get(`/employee/code-value/${id}?code=RELATIONSHIP`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({
          value: name,
          isEnabled: true,
          isSystemDefined: false,
          codeId: {
            code: 'RELATIONSHIP'
          }
        });
      })
      .expect(HttpStatus.OK);

    // delete
    await request(API_ENDPOINT)
      .delete(`/employee/code-value/${id}?code=RELATIONSHIP`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NO_CONTENT);

    // get one after delete
    await request(API_ENDPOINT)
      .get(`/employee/code-value/${id}?code=RELATIONSHIP`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('Test create relationship with duplicate name', async () => {
    const name = uuidv4();
    await request(API_ENDPOINT)
      .post('/employee/code-value?code=RELATIONSHIP')
      .send({ value: name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    // create with duplicate name
    await request(API_ENDPOINT)
      .post('/employee/code-value?code=RELATIONSHIP')
      .send({ value: name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CONFLICT);
  });

  it('Test update isEnabled for language', async () => {
    const name = uuidv4();
    const response = await request(API_ENDPOINT)
      .post('/employee/code-value?code=LANGUAGE')
      .send({ value: name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    const id = response.body.data.id;

    // get one
    await request(API_ENDPOINT)
      .get(`/employee/code-value/${id}?code=LANGUAGE`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({
          value: name,
          isEnabled: true,
          isSystemDefined: false,
          codeId: {
            code: 'LANGUAGE'
          }
        });
      })
      .expect(HttpStatus.OK);

    // update
    await request(API_ENDPOINT)
      .patch(`/employee/code-value/${id}?code=LANGUAGE`)
      .send({ isEnabled: false })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(id);
      })
      .expect(HttpStatus.OK);

    // get one after update
    await request(API_ENDPOINT)
      .get(`/employee/code-value/${id}?code=LANGUAGE`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({
          isEnabled: false
        });
      })
      .expect(HttpStatus.OK);
  });

  it('Test modify on system defined true', async () => {
    const response = await request(API_ENDPOINT)
      .get(
        '/employee/code-value?code=RELATIONSHIP&limit=10&isSystemDefined=true'
      )
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK);
    const id = response.body.data[0].id;

    // update
    await request(API_ENDPOINT)
      .patch(`/employee/code-value/${id}?code=RELATIONSHIP`)
      .send({ name: 'test' })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `You are not allowed to make any changes due to system defined`
        );
      })
      .expect(HttpStatus.FORBIDDEN);

    // delete
    await request(API_ENDPOINT)
      .delete(`/employee/code-value/${id}?code=RELATIONSHIP`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `You are not allowed to make any changes due to system defined`
        );
      })
      .expect(HttpStatus.FORBIDDEN);
  });
});
