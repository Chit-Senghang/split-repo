import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../../test/environment';
import { UpdatePayrollCycleConfigurationDto } from '../../../apps/employee/src/payroll-cycle-configuration/dto/update-payroll-cycle-configuration.dto';
import { PayrollCycleConfigurationMonthEnum } from '../../../apps/employee/src/payroll-cycle-configuration/enums/payroll-cycle-configuration.enum';
import { getAccessToken } from '../../../test/common/common.e2e.service';

describe('Test Payroll Cycle Configuration', () => {
  let accessToken: string;
  beforeAll(async () => {
    accessToken = await getAccessToken();
  });

  it('Get single record', async () => {
    //expect id = 1 because we seed the data; there is not endpoint to create new record
    await request(API_ENDPOINT)
      .get(`/employee/payroll-cycle-configuration`)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect((res) => expect(res.body.data.id).toEqual(1));
  });

  it('Update using put method', async () => {
    const payrollCycleConfigurationDto: UpdatePayrollCycleConfigurationDto = {
      firstCycleFromDate: 1,
      firstCycleToDate: 15,
      firstCycleFromMonth: PayrollCycleConfigurationMonthEnum.CURRENT,
      firstCycleToMonth: PayrollCycleConfigurationMonthEnum.CURRENT,
      secondCycleFromDate: null,
      secondCycleToDate: null,
      secondCycleFromMonth: null,
      secondCycleToMonth: null
    };

    //case success
    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect((res) => expect(res.body.data.id).toEqual(1));

    //case second from date with no secondCycleFromMonth
    payrollCycleConfigurationDto.firstCycleFromDate = 1;
    payrollCycleConfigurationDto.firstCycleToDate = 15;
    payrollCycleConfigurationDto.secondCycleFromDate = 16;
    payrollCycleConfigurationDto.secondCycleToDate = 31;
    payrollCycleConfigurationDto.secondCycleFromMonth = null;
    payrollCycleConfigurationDto.secondCycleToMonth = null;

    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) =>
        expect(res.body.errors[0].message).toContain(
          'The second cycle from month must not be empty.'
        )
      );

    //case second to date with no secondCycleToMonth
    payrollCycleConfigurationDto.secondCycleFromMonth =
      PayrollCycleConfigurationMonthEnum.CURRENT;
    payrollCycleConfigurationDto.secondCycleToMonth = null;

    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) =>
        expect(res.body.errors[0].message).toContain(
          'The second cycle to month must not be empty.'
        )
      );

    //case second from date with no secondCycleFromMonth
    payrollCycleConfigurationDto.secondCycleToMonth =
      PayrollCycleConfigurationMonthEnum.CURRENT;
    payrollCycleConfigurationDto.secondCycleFromMonth = null;

    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) =>
        expect(res.body.errors[0].message).toContain(
          'The second cycle from month must not be empty.'
        )
      );

    //case second from month with no secondCycleFromDate
    payrollCycleConfigurationDto.secondCycleFromMonth =
      PayrollCycleConfigurationMonthEnum.CURRENT;
    payrollCycleConfigurationDto.secondCycleFromDate = null;

    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) =>
        expect(res.body.errors[0].message).toContain(
          'The second cycle from date must not be empty.'
        )
      );

    //case second to month with no secondCycleToDate
    payrollCycleConfigurationDto.secondCycleFromDate = 16;
    payrollCycleConfigurationDto.secondCycleToDate = null;

    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) =>
        expect(res.body.errors[0].message).toContain(
          'The second cycle to date must not be empty.'
        )
      );

    //case second from date between first from and first to date
    payrollCycleConfigurationDto.secondCycleToDate = 15;
    payrollCycleConfigurationDto.secondCycleFromDate = 8;
    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) => {
        expect(res.body.errors[0].message).toContain(
          'The second cycle from date must be greater than first cycle to date one day.'
        );
      });

    //case second from date greater than first to date two days; not allow
    payrollCycleConfigurationDto.secondCycleFromDate = 17;
    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) =>
        expect(res.body.errors[0].message).toContain(
          'The second cycle from date must be greater than first cycle to date one day.'
        )
      );

    //case second from date greater than second to date
    payrollCycleConfigurationDto.secondCycleFromDate = 16;
    payrollCycleConfigurationDto.secondCycleToDate = 15;
    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) =>
        expect(res.body.errors[0].message).toContain(
          'The second cycle from date must not be greater than or equal to second cycle to date.'
        )
      );

    //case first from date is the same as first to date
    payrollCycleConfigurationDto.firstCycleFromDate = 1;
    payrollCycleConfigurationDto.firstCycleToDate = 1;
    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) =>
        expect(res.body.errors[0].message).toContain(
          'The first cycle from date must not be greater than or equal to first cycle to date.'
        )
      );

    //case second from date is the same as second to date
    payrollCycleConfigurationDto.firstCycleFromDate = 1;
    payrollCycleConfigurationDto.firstCycleToDate = 15;
    payrollCycleConfigurationDto.secondCycleFromDate = 16;
    payrollCycleConfigurationDto.secondCycleFromDate = 16;

    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) =>
        expect(res.body.errors[0].message).toContain(
          'The second cycle from date must not be greater than or equal to second cycle to date.'
        )
      );

    //case success with first and second payroll cycle configuration
    payrollCycleConfigurationDto.firstCycleFromDate = 1;
    payrollCycleConfigurationDto.firstCycleToDate = 15;
    payrollCycleConfigurationDto.firstCycleFromMonth =
      PayrollCycleConfigurationMonthEnum.CURRENT;
    payrollCycleConfigurationDto.firstCycleToMonth =
      PayrollCycleConfigurationMonthEnum.CURRENT;
    payrollCycleConfigurationDto.secondCycleFromDate = 16;
    payrollCycleConfigurationDto.secondCycleToDate = 31;
    payrollCycleConfigurationDto.secondCycleFromMonth =
      PayrollCycleConfigurationMonthEnum.CURRENT;
    payrollCycleConfigurationDto.secondCycleToMonth =
      PayrollCycleConfigurationMonthEnum.CURRENT;

    //case success
    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect((res) => expect(res.body.data.id).toEqual(1));

    //case two times with PREVIOUS month, not allowed.
    payrollCycleConfigurationDto.firstCycleFromMonth =
      PayrollCycleConfigurationMonthEnum.PREVIOUS;

    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) =>
        expect(res.body.errors[0].message).toContain(
          'The first cycle from month must not be previous.'
        )
      );

    payrollCycleConfigurationDto.firstCycleFromMonth =
      PayrollCycleConfigurationMonthEnum.CURRENT;

    payrollCycleConfigurationDto.firstCycleToMonth =
      PayrollCycleConfigurationMonthEnum.PREVIOUS;

    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) =>
        expect(res.body.errors[0].message).toContain(
          'The first cycle to month must not be previous.'
        )
      );

    payrollCycleConfigurationDto.firstCycleToMonth =
      PayrollCycleConfigurationMonthEnum.CURRENT;

    payrollCycleConfigurationDto.secondCycleFromMonth =
      PayrollCycleConfigurationMonthEnum.PREVIOUS;

    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) =>
        expect(res.body.errors[0].message).toContain(
          'The second cycle from month must not be previous.'
        )
      );

    payrollCycleConfigurationDto.secondCycleFromMonth =
      PayrollCycleConfigurationMonthEnum.CURRENT;
    payrollCycleConfigurationDto.secondCycleToMonth =
      PayrollCycleConfigurationMonthEnum.PREVIOUS;

    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) =>
        expect(res.body.errors[0].message).toContain(
          'The second cycle to month must not be previous.'
        )
      );

    payrollCycleConfigurationDto.secondCycleToMonth =
      PayrollCycleConfigurationMonthEnum.CURRENT;

    //case success again with two times
    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect((res) => expect(res.body.data.id).toEqual(1));

    //case success again with one times
    payrollCycleConfigurationDto.firstCycleFromDate = 25;
    payrollCycleConfigurationDto.firstCycleToDate = 25;
    payrollCycleConfigurationDto.firstCycleFromMonth =
      PayrollCycleConfigurationMonthEnum.PREVIOUS;
    payrollCycleConfigurationDto.firstCycleToMonth =
      PayrollCycleConfigurationMonthEnum.CURRENT;
    payrollCycleConfigurationDto.secondCycleFromDate = null;
    payrollCycleConfigurationDto.secondCycleToDate = null;
    payrollCycleConfigurationDto.secondCycleFromMonth = null;
    payrollCycleConfigurationDto.secondCycleToMonth = null;
    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.OK)
      .expect((res) => expect(res.body.data.id).toEqual(1));

    //case one time with firstCycleToMonth = PREVIOUS, not allowed
    payrollCycleConfigurationDto.firstCycleFromMonth =
      PayrollCycleConfigurationMonthEnum.CURRENT;
    payrollCycleConfigurationDto.firstCycleToMonth =
      PayrollCycleConfigurationMonthEnum.PREVIOUS;
    await request(API_ENDPOINT)
      .put(`/employee/payroll-cycle-configuration`)
      .send(payrollCycleConfigurationDto)
      .set(AUTHORIZATION_KEY, accessToken)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) =>
        expect(res.body.errors[0].message).toContain(
          'The first cycle to month must not be previous.'
        )
      );
  });
});
