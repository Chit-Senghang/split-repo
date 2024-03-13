import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ReasonTemplateTypeEnum } from '../../../apps/employee/src/reason-template/common/ts/enum/type.enum';
import {
  getAccessToken,
  getReasonTemplateTypeOTHER
} from '../../common/common.e2e.service';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';

describe('ReasonTemplateTest', () => {
  let accessToken: string;
  let name: string;
  beforeAll(async () => {
    accessToken = await getAccessToken();
    name = uuidv4();
  });
  it('Reason Template with crud', async () => {
    const response = await request(API_ENDPOINT)
      .post('/employee/reason-template')
      .send({ name, type: ReasonTemplateTypeEnum.EMPLOYEE_MOVEMENT })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);
    const id = response.body.data.id;

    // duplicate create
    await request(API_ENDPOINT)
      .post('/employee/reason-template')
      .send({ name, type: ReasonTemplateTypeEnum.EMPLOYEE_MOVEMENT })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `${name} already exists`
        );
      })
      .expect(HttpStatus.CONFLICT);

    await request(API_ENDPOINT)
      .get(`/employee/reason-template?type=OTHER&limit=10`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      })
      .expect(HttpStatus.OK);

    //* Get one
    await request(API_ENDPOINT)
      .get(`/employee/reason-template/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data).toMatchObject({ name });
      })
      .expect(HttpStatus.OK);

    //GET: reason template type = OTHER
    const reasonTemplate = await getReasonTemplateTypeOTHER(accessToken);
    name = uuidv4();

    //UPDATE: name and type reason template type OTHER; get error
    await request(API_ENDPOINT)
      .patch(`/employee/reason-template/${reasonTemplate.id}`)
      .send({ name, type: ReasonTemplateTypeEnum.EMPLOYEE_MOVEMENT })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.errors.at(0).message).toEqual(
          'You cannot change type of record because of system defined.'
        );
      })
      .expect(HttpStatus.BAD_REQUEST);

    //UPDATE: name of reason template type OTHER; success
    await request(API_ENDPOINT)
      .patch(`/employee/reason-template/${reasonTemplate.id}`)
      .send({ name })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(reasonTemplate.id);
      })
      .expect(HttpStatus.OK);

    //UPDATE: success
    name = uuidv4();
    await request(API_ENDPOINT)
      .patch(`/employee/reason-template/${id}`)
      .send({ name, type: ReasonTemplateTypeEnum.EMPLOYEE_MOVEMENT })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).toEqual(id);
      })
      .expect(HttpStatus.OK);

    //DELETE: reason template system defined
    await request(API_ENDPOINT)
      .delete(`/employee/reason-template/${reasonTemplate.id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) =>
        expect(res.body.errors.at(0).message).toEqual(
          'You cannot delete because of system defined.'
        )
      );

    //DELETE: reason template by id
    await request(API_ENDPOINT)
      .delete(`/employee/reason-template/${id}`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.NO_CONTENT);
  });

  it('Create Type All and Get All', async () => {
    //CASE: create reason template with type = ALL
    name = uuidv4();
    await request(API_ENDPOINT)
      .post('/employee/reason-template')
      .send({ name, type: ReasonTemplateTypeEnum.ALL })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.id).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    //GET: all record type = ALL
    await request(API_ENDPOINT)
      .get(`/employee/reason-template?type=ALL&limit=10`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        expect(res.body.data.length).toBeGreaterThan(0);
      })
      .expect(HttpStatus.OK);
  });
});
