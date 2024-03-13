import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus, Logger } from '@nestjs/common';
import { CreateUserDto } from 'apps/authentication/src/user/dto/create-user.dto';
import {
  API_ENDPOINT,
  AUTHORIZATION_KEY,
  TOKEN_URL
} from '../../test/environment';
import {
  createEmployeeWithCompanyStructure,
  createRole,
  findEmployeeById,
  getAccessToken,
  getPermissionIdsByNames,
  getRandomEmailFaker,
  getRandomPasswordFaker,
  getRandomPhoneFaker
} from '../../test/common/common.e2e.service';

describe('AuthenticationTest', () => {
  let accessToken: string;
  const randomEmail = getRandomEmailFaker();
  let randomPhone: string;
  beforeAll(async () => {
    accessToken = await getAccessToken();
    randomPhone = getRandomPhoneFaker();
  });

  it('Test create role', async () => {
    const permissionIds = await getPermissionIdsByNames(
      ['ALL_FUNCTION'],
      accessToken
    );

    // create role
    const roleName = `role ${uuidv4()}`;
    const requestBody = {
      name: roleName,
      description: 'test',
      permissionId: permissionIds
    };
    const response = await request(API_ENDPOINT)
      .post('/authentication/role')
      .send(requestBody)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.CREATED);
    const roleId = response.body.data.id;

    // get role by id
    await request(API_ENDPOINT)
      .get(`/authentication/role/${roleId}?includePermission=true`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK);

    //create duplicate role
    await request(API_ENDPOINT)
      .post('/authentication/role')
      .send(requestBody)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(`Data already exist.`);
      })
      .expect(HttpStatus.CONFLICT);
  });

  it('Test get users', async () => {
    await request(API_ENDPOINT)
      .get('/authentication/user')
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(200);
  });

  it('Test create user', async () => {
    const roleId = await createRole(accessToken, ['ALL_FUNCTION']);
    const username = uuidv4();
    const payload = {
      username,
      phone: randomPhone,
      email: randomEmail,
      password: getRandomPasswordFaker(),
      roles: [roleId],
      isSelfService: false
    };

    // create user
    await request(API_ENDPOINT)
      .post('/authentication/user')
      .send(payload)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        Logger.log(res.body);
      })
      .expect(HttpStatus.CREATED);

    // create user with duplicate
    await request(API_ENDPOINT)
      .post('/authentication/user')
      .send(payload)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(`Data already exist.`);
      })
      .expect(HttpStatus.CONFLICT);

    //CREATE: new employee
    const employeeId = await createEmployeeWithCompanyStructure(accessToken);
    const employee = await findEmployeeById(employeeId, accessToken);

    //CREATE: new user
    const newPassword = getRandomPasswordFaker();
    const createUserDto: CreateUserDto = {
      username: employee.contacts.at(0).contact,
      phone: employee.contacts.at(0).contact,
      email: employee.email,
      password: newPassword,
      roles: [roleId],
      isSelfService: true,
      resetPassword: false
    };
    const newUserResponse = await createUser(accessToken, createUserDto);

    //UPDATE: update email to null
    createUserDto.email = null;
    await updateUser(accessToken, newUserResponse.body.data.id, createUserDto);

    //GET: user email suppose to be null
    await getUserExpectEmailNull(accessToken, newUserResponse.body.data.id);

    //UPDATE: update email to undefined
    delete createUserDto.email;
    await updateUser(accessToken, newUserResponse.body.data.id, createUserDto);

    //GET: user email suppose to be null
    await getUserExpectEmailNull(accessToken, newUserResponse.body.data.id);

    //UPDATE: update email with empty string
    createUserDto.email = '';
    await request(API_ENDPOINT)
      .patch(`/authentication/user/${newUserResponse.body.data.id}`)
      .send(createUserDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((err) => {
        const errorResponse = JSON.parse(err.text);
        expect(errorResponse.errors[0].message).toEqual(
          `email must be an email`
        );
      });

    //GET: otp code and key
    const response = await request(API_ENDPOINT)
      .post('/auth/get-otp')
      .send({ phone: employee.contacts[0].contact })
      .expect((res) => {
        expect(res.body.data.key).not.toBeNull();
        expect(res.body.data.code).not.toBeNull();
      })
      .expect(HttpStatus.CREATED);

    //FORGOT: password
    await request(API_ENDPOINT)
      .patch('/auth/forgot-password')
      .send({
        phone: employee.contacts[0].contact,
        password: newPassword,
        key: response.body.data.key,
        code: response.body.data.code
      })
      .expect((res) => {
        expect(res.body.data).toEqual(newUserResponse.body.data.id);
      })
      .expect(HttpStatus.OK);

    //LOGIN: with new password, expect error because not yet attach user to employee
    await request(API_ENDPOINT)
      .post(TOKEN_URL)
      .send({
        username: employee.contacts.at(0).contact,
        password: newPassword
      })
      .expect((res) => {
        expect(res.body.errors.at(0).message).toEqual(
          'User requires one employee.'
        );
      })
      .expect(HttpStatus.BAD_REQUEST);

    //ATTACH: user to employee by admin
    await request(API_ENDPOINT)
      .patch(`/employee/employee-master-information/${employee.id}/user`)
      .send({ userId: newUserResponse.body.data.id })
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK);

    //LOGIN: again and expect success
    await request(API_ENDPOINT)
      .post(TOKEN_URL)
      .send({
        username: employee.contacts.at(0).contact,
        password: newPassword
      })
      .expect(HttpStatus.CREATED);
  });
});

const createUser = async (
  accessToken: string,
  createUserDto: CreateUserDto
) => {
  return await request(API_ENDPOINT)
    .post(`/authentication/user`)
    .send(createUserDto)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED);
};

const updateUser = async (
  accessToken: string,
  id: number,
  createUserDto: CreateUserDto
) => {
  await request(API_ENDPOINT)
    .patch(`/authentication/user/${id}`)
    .send(createUserDto)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK);
};

const getUserExpectEmailNull = async (accessToken: string, id: number) => {
  await request(API_ENDPOINT)
    .get(`/authentication/user/${id}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      expect(res.body.data.email).toBeNull();
    });
};
