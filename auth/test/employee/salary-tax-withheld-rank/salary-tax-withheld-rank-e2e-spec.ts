import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { SalaryTaxWithheldRank } from '../../../apps/employee/src/salary-tax-withheld-rank/entities/salary-tax-withheld-rank.entity';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';
import { SalaryTaxTypeEnum } from '../../../apps/employee/src/salary-tax-withheld-rank/enums/salary-tax-type.enum';
import { CreateSalaryTaxWithheldRankDto } from '../../../apps/employee/src/salary-tax-withheld-rank/dto/create-salary-tax-withheld-rank.dto';
import { getAccessToken } from '../../../test/common/common.e2e.service';

describe('Test Salary Tax Withheld Rank', () => {
  let accessToken: string;
  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  describe('Test Get All and Delete Record with Infinite ToAmount', () => {
    it('Test Salary Tax Withheld Rank', async () => {
      //CASE: get all records with no expectation
      const response = await request(API_ENDPOINT)
        .get('/employee/salary-tax-withheld-rank')
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.OK);

      // get salary tax withheld rank that has toAmount null = infinite
      const salaryTaxWithheldRank = response.body.data.find(
        (salaryTaxWithheldRank: SalaryTaxWithheldRank) =>
          !salaryTaxWithheldRank.toAmount
      );

      if (salaryTaxWithheldRank) {
        // CASE: get one
        await request(API_ENDPOINT)
          .get(`/employee/salary-tax-withheld-rank/${salaryTaxWithheldRank.id}`)
          .set(AUTHORIZATION_KEY, accessToken)
          .expect(HttpStatus.OK)
          .expect((res) =>
            expect(res.body.data.id).toEqual(salaryTaxWithheldRank.id)
          );

        //CASE: delete before creating another record
        await request(API_ENDPOINT)
          .delete(
            `/employee/salary-tax-withheld-rank/${salaryTaxWithheldRank.id}`
          )
          .set(AUTHORIZATION_KEY, accessToken)
          .expect(HttpStatus.NO_CONTENT);
      }
    });
  });

  describe('Test Cases Create', () => {
    it('Test create', async () => {
      //CASE: get all records without expectation
      const response = await request(API_ENDPOINT)
        .get('/employee/salary-tax-withheld-rank')
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.OK);

      const lastSalaryTaxWithheldRank = response.body.data.at(-1);
      const createSalaryTaxWithheldRankDto: CreateSalaryTaxWithheldRankDto = {
        fromAmount: lastSalaryTaxWithheldRank
          ? Number(lastSalaryTaxWithheldRank.toAmount) + 1
          : 1000000,
        toAmount: lastSalaryTaxWithheldRank
          ? Number(lastSalaryTaxWithheldRank.toAmount) + 2
          : 1500000,
        taxRate: 0,
        deduction: 0,
        type: SalaryTaxTypeEnum.TAX_WITHHELD_RANK
      };

      // if not record, create new one
      if (!lastSalaryTaxWithheldRank) {
        await request(API_ENDPOINT)
          .post('/employee/salary-tax-withheld-rank')
          .send(createSalaryTaxWithheldRankDto)
          .set(AUTHORIZATION_KEY, accessToken)
          .expect(HttpStatus.CREATED);
      }

      createSalaryTaxWithheldRankDto.fromAmount =
        Number(createSalaryTaxWithheldRankDto.toAmount) + 1;
      createSalaryTaxWithheldRankDto.toAmount =
        Number(createSalaryTaxWithheldRankDto.toAmount) + 1000;

      await request(API_ENDPOINT)
        .post('/employee/salary-tax-withheld-rank')
        .send(createSalaryTaxWithheldRankDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CREATED);

      //CASE: create success
      createSalaryTaxWithheldRankDto.fromAmount =
        Number(createSalaryTaxWithheldRankDto.toAmount) + 1;
      createSalaryTaxWithheldRankDto.toAmount = null;
      const newResponse = await request(API_ENDPOINT)
        .post('/employee/salary-tax-withheld-rank')
        .send(createSalaryTaxWithheldRankDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CREATED);

      //CASE: get one after create
      await request(API_ENDPOINT)
        .get(`/employee/salary-tax-withheld-rank/${newResponse.body.data.id}`)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.OK)
        .expect((res) => {
          const salaryTaxWithheldRank = newResponse.body.data;
          expect(res.body.data.id).toEqual(salaryTaxWithheldRank.id);
          expect(Number(res.body.data.fromAmount)).toEqual(
            createSalaryTaxWithheldRankDto.fromAmount
          );
          expect(
            res.body.data.toAmount && Number(res.body.data.toAmount)
          ).toEqual(createSalaryTaxWithheldRankDto.toAmount);
        });
      //CASE: create fromAmount between existing range and infinite toAmount already exist
      createSalaryTaxWithheldRankDto.fromAmount = Number(
        createSalaryTaxWithheldRankDto.fromAmount
      );
      await request(API_ENDPOINT)
        .post('/employee/salary-tax-withheld-rank')
        .send(createSalaryTaxWithheldRankDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CONFLICT)
        .expect((res) => {
          expect(res.body.errors[0].message).toContain(
            'From amount already exists in other range.'
          );
        });

      createSalaryTaxWithheldRankDto.fromAmount =
        Number(createSalaryTaxWithheldRankDto.toAmount) + 1;
      createSalaryTaxWithheldRankDto.toAmount = null;
      await request(API_ENDPOINT)
        .post('/employee/salary-tax-withheld-rank')
        .send(createSalaryTaxWithheldRankDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CONFLICT)
        .expect((res) => {
          expect(res.body.errors[0].message).toContain(
            'From amount already exists in other range.'
          );
        });

      //CASE: get all records
      await request(API_ENDPOINT)
        .get('/employee/salary-tax-withheld-rank')
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.OK)
        .expect((res) => expect(res.body.data.length).toBeGreaterThan(0));
    });
  });

  describe('Test Cases Update', () => {
    it('Test update', async () => {
      const response = await request(API_ENDPOINT)
        .get('/employee/salary-tax-withheld-rank')
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.OK)
        .expect((res) => expect(res.body.data.length).toBeGreaterThan(0));

      // get salary tax withheld rank that has toAmount null = infinite
      const salaryTaxWithheldRank = response.body.data.find(
        (salaryTaxWithheldRank: SalaryTaxWithheldRank) =>
          !salaryTaxWithheldRank.toAmount
      );

      //CASE: delete before update
      if (salaryTaxWithheldRank) {
        await request(API_ENDPOINT)
          .delete(
            `/employee/salary-tax-withheld-rank/${salaryTaxWithheldRank.id}`
          )
          .set(AUTHORIZATION_KEY, accessToken)
          .expect(HttpStatus.NO_CONTENT);

        //CASE: get one after delete; expect not found
        await request(API_ENDPOINT)
          .get(`/employee/salary-tax-withheld-rank/${salaryTaxWithheldRank.id}`)
          .set(AUTHORIZATION_KEY, accessToken)
          .expect(HttpStatus.NOT_FOUND)
          .expect((res) =>
            expect(res.body.errors[0].message).toContain(
              `Resource Salary Tax Withheld Rank of ${salaryTaxWithheldRank.id} not found`
            )
          );
      }
      const createSalaryTaxWithheldRankDto: CreateSalaryTaxWithheldRankDto = {
        fromAmount: Number(response.body.data.at(-2).fromAmount),
        toAmount: null,
        taxRate: 0,
        deduction: 0,
        type: SalaryTaxTypeEnum.TAX_WITHHELD_RANK
      };
      //CASE: update success
      await request(API_ENDPOINT)
        .patch(
          `/employee/salary-tax-withheld-rank/${response.body.data.at(-2).id}`
        )
        .send(createSalaryTaxWithheldRankDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.OK);

      //CASE: update with amount in existing date range
      createSalaryTaxWithheldRankDto.toAmount = Number(
        response.body.data.at(-2).toAmount
      );
      await request(API_ENDPOINT)
        .patch(
          `/employee/salary-tax-withheld-rank/${response.body.data.at(0).id}`
        )
        .send(createSalaryTaxWithheldRankDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CONFLICT)
        .expect((res) => {
          expect(res.body.errors[0].message).toContain(
            'From amount already exists in other range.'
          );
        });
    });
  });
});
