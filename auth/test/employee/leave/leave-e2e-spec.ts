import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PublicHoliday } from '../../../apps/employee/src/attendance/public-holiday/entities/public-holiday.entity';
import { LeaveStock } from '../../../apps/employee/src/leave/leave-request/entities/leave-stock.entity';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_DAY_FORMAT,
  DEFAULT_MONTH_FORMAT,
  DEFAULT_SECOND_FORMAT
} from '../../../apps/shared-resources/common/dto/default-date-format';
import {
  dayJs,
  getCurrentDateWithFormat
} from '../../../apps/shared-resources/common/utils/date-utils';
import { UpdateProbationEmployeeStatusEnum } from '../../../apps/employee/src/employee/enum/employee-status.enum';
import { ReasonTemplate } from '../../../apps/employee/src/reason-template/entities/reason-template.entity';
import { ReasonTemplateTypeEnum } from '../../../apps/employee/src/reason-template/common/ts/enum/type.enum';
import { LeaveTypeVariation } from '../../../apps/employee/src/leave/leave-request-type/entities/leave-type-variation.entity';
import { LeaveRequestDurationTypeEnEnum } from '../../../apps/employee/src/leave/leave-request/enums/leave-request-duration-type.enum';
import { LeaveType } from '../../../apps/employee/src/leave/leave-request-type/entities/leave-type.entity';
import { CreateLeaveRequestDto } from '../../../apps/employee/src/leave/leave-request/dto/create-leave-request.dto';
import { API_ENDPOINT, AUTHORIZATION_KEY } from '../../environment';
import {
  createCompanyStructureTree,
  getAccessToken,
  getPositionLevelByName
} from '../../common/common.e2e.service';
import { createEmployee } from '../employee-position-in-structure/create-employee.service';
import { LeaveTypeEnum } from './enums/leave-type.enum';
import { PositionLevelTitleEnum } from './../../../apps/shared-resources/ts/enum/permission/employee/position-level.enum';

describe('Leave Request', () => {
  let accessToken: string;
  const publicHolidayIds: number[] = [];

  beforeEach(async () => {
    accessToken = await getAccessToken();
  });

  afterAll(async () => {
    await Promise.all(
      publicHolidayIds.map(async (id: number) => {
        await request(API_ENDPOINT)
          .delete(`/employee/public-holiday/${id}`)
          .set(AUTHORIZATION_KEY, accessToken)
          .expect(HttpStatus.NO_CONTENT);
      })
    );
  });

  describe('Test Public Holiday Leave', () => {
    it('Test create public holiday', async () => {
      //create public holiday for today
      const currentDate = getCurrentDateWithFormat();
      await createPublicHoliday(accessToken, currentDate);

      // create public holiday for next month
      await createPublicHoliday(
        accessToken,
        dayJs(currentDate).add(1, 'month').format(DEFAULT_DATE_FORMAT)
      );

      //expect to get three public holidays
      const response = await request(API_ENDPOINT)
        .get('/employee/public-holiday')
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.OK)
        .expect((res) => expect(res.body.data.length).toEqual(2));

      response.body.data.forEach((publicHoliday: PublicHoliday) => {
        publicHolidayIds.push(publicHoliday.id);
      });
    });

    it('Test With Create Public holiday', async () => {
      //create new employee
      const employeeId =
        await createEmployeeAndUpdateToPassProbation(accessToken);

      const leaveTypeVariation: LeaveTypeVariation =
        await getEmployeeLeaveTypeVariation(
          accessToken,
          employeeId,
          LeaveTypeEnum.PUBLIC_HOLIDAY_LEAVE
        );

      const reasonTemplate: ReasonTemplate =
        await getReasonTemplateTypeOther(accessToken);

      //leave request dto for three days
      const createLeaveRequestDto: CreateLeaveRequestDto = {
        employeeId,
        leaveRequestTypeId: leaveTypeVariation.id,
        durationType: LeaveRequestDurationTypeEnEnum.DATE_RANGE,
        fromDate: dayJs().format(DEFAULT_DATE_FORMAT),
        toDate: dayJs().add(1, 'day').format(DEFAULT_DATE_FORMAT), //TWO days
        documentIds: [],
        reason: 'From test.',
        reasonTemplateId: reasonTemplate.id,
        isPublicHoliday: true,
        isSpecialLeave: false
      };

      //generate annual leave after pass probation
      const leaveType: LeaveType = await getLeaveTypeByEnum(
        accessToken,
        LeaveTypeEnum.PUBLIC_HOLIDAY_LEAVE
      );

      await request(API_ENDPOINT)
        .post(`/employee/leave-request-type/generate-stock/${leaveType.id}`)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CREATED);

      // generate leave stock for annual leave
      // get initial value of leave stock
      const { remaining: leaveDayRemaining } =
        await getLeaveStockWithValidateStock(
          employeeId,
          createLeaveRequestDto.fromDate,
          accessToken,
          LeaveTypeEnum.PUBLIC_HOLIDAY_LEAVE
        );

      // request 2 days in a month; expect error
      await request(API_ENDPOINT)
        .post('/employee/leave-request')
        .send(createLeaveRequestDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) =>
          expect(res.body.errors[0].message).toContain(
            'You cannot request leave more than 1 days.'
          )
        )
        .expect(HttpStatus.CONFLICT);

      // request 1 days in a month; expect success
      createLeaveRequestDto.toDate = dayJs().format(DEFAULT_DATE_FORMAT);

      await request(API_ENDPOINT)
        .post('/employee/leave-request')
        .send(createLeaveRequestDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CREATED);

      // re-check stock
      await getLeaveStockWithValidateStock(
        employeeId,
        createLeaveRequestDto.fromDate,
        accessToken,
        LeaveTypeEnum.PUBLIC_HOLIDAY_LEAVE,
        leaveDayRemaining
      );

      // request one more day for next month
      createLeaveRequestDto.fromDate = dayJs()
        .add(1, 'month')
        .format(DEFAULT_DATE_FORMAT);
      createLeaveRequestDto.toDate = dayJs()
        .add(1, 'month')
        .format(DEFAULT_DATE_FORMAT);
      await request(API_ENDPOINT)
        .post('/employee/leave-request')
        .send(createLeaveRequestDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CREATED);
    });
  });

  describe('Test Unpaid Leave', () => {
    it('Create unpaid leave', async () => {
      const employeeId =
        await createEmployeeAndUpdateToPassProbation(accessToken);

      const leaveTypeVariation: LeaveTypeVariation =
        await getEmployeeLeaveTypeVariation(
          accessToken,
          employeeId,
          LeaveTypeEnum.UNPAID_LEAVE
        );

      const reasonTemplate: ReasonTemplate =
        await getReasonTemplateTypeOther(accessToken);

      const createLeaveRequestDto: CreateLeaveRequestDto = {
        employeeId,
        leaveRequestTypeId: leaveTypeVariation.id,
        durationType: LeaveRequestDurationTypeEnEnum.DATE_RANGE,
        fromDate: dayJs()
          .set('month', 1)
          .set('date', 1)
          .format(DEFAULT_DATE_FORMAT),
        toDate: dayJs()
          .set('month', 6)
          .set('date', 30)
          .format(DEFAULT_DATE_FORMAT),
        documentIds: [],
        reason: 'From test.',
        reasonTemplateId: reasonTemplate.id,
        isPublicHoliday: false,
        isSpecialLeave: false
      };

      const { remaining: leaveDayRemaining } =
        await getLeaveStockWithValidateStock(
          employeeId,
          createLeaveRequestDto.fromDate,
          accessToken,
          LeaveTypeEnum.UNPAID_LEAVE
        );

      await request(API_ENDPOINT)
        .post(`/employee/leave-request`)
        .send(createLeaveRequestDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect((res) => {
          expect(res.body.errors[0].message).toContain(
            'Not enough leave stock.'
          );
        })
        .expect(HttpStatus.CONFLICT);

      createLeaveRequestDto.toDate = dayJs()
        .set('month', 6)
        .set('date', 29)
        .format(DEFAULT_DATE_FORMAT);
      await request(API_ENDPOINT)
        .post(`/employee/leave-request`)
        .send(createLeaveRequestDto)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CREATED);

      const { remaining, used, leaveTypeId } =
        await getLeaveStockWithValidateStock(
          employeeId,
          createLeaveRequestDto.fromDate,
          accessToken,
          LeaveTypeEnum.UNPAID_LEAVE,
          leaveDayRemaining
        );

      await checkStockDetailUnpaidLeave(
        accessToken,
        employeeId,
        leaveTypeId,
        createLeaveRequestDto.fromDate,
        used,
        remaining
      );
    });
  });

  describe('Test Annual Leave with prorate, leave top-up and special leave', () => {
    it('Create annual leave', async () => {
      const currentDate = getCurrentDateMatchedServerFormat();
      const employeeId =
        await createEmployeeAndUpdateToPassProbation(accessToken);

      //generate annual leave after pass probation
      const leaveType: LeaveType = await getLeaveTypeByEnum(
        accessToken,
        LeaveTypeEnum.ANNUAL_LEAVE
      );

      //generate leave stock for annual leave
      await request(API_ENDPOINT)
        .post(`/employee/leave-request-type/generate-stock/${leaveType.id}`)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CREATED);

      const leaveTypeVariation: LeaveTypeVariation =
        await getEmployeeLeaveTypeVariation(
          accessToken,
          employeeId,
          LeaveTypeEnum.ANNUAL_LEAVE
        );

      const reasonTemplate: ReasonTemplate =
        await getReasonTemplateTypeOther(accessToken);

      // Set date to next year 2024-11-30
      await request(API_ENDPOINT)
        .post('/auth/system-test/set-date')
        .send({
          date: `${dayJs()
            .set('month', 10)
            .format(DEFAULT_MONTH_FORMAT)}${dayJs()
            .set('date', 30)
            .format('DDHHMM')}${dayJs().year()}.${dayJs().format(
            DEFAULT_SECOND_FORMAT
          )}`
        })
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CREATED);

      accessToken = await getAccessToken();

      await requestAnnualLeaveExceedingProrateAndSuccess(
        employeeId,
        leaveTypeVariation.id,
        reasonTemplate.id,
        accessToken
      );

      // Set date to current date
      await setDateBackToCurrentDate(accessToken, currentDate);
    });
  });

  describe('Test Annual Leave with Carry Forward', () => {
    it('Test annual leave with carry forward', async () => {
      const currentDate = getCurrentDateMatchedServerFormat();
      accessToken = await getAccessToken();
      const employeeId =
        await createEmployeeAndUpdateToPassProbation(accessToken);

      const leaveType: LeaveType = await getLeaveTypeByEnum(
        accessToken,
        LeaveTypeEnum.ANNUAL_LEAVE
      );

      //case carryForward; set year to next year Ex: 2025-02-20
      await request(API_ENDPOINT)
        .post('/authentication/system-test/set-date')
        .send({
          date: `${dayJs()
            .set('month', 1)
            .format(DEFAULT_MONTH_FORMAT)}${dayJs()
            .set('date', 20)
            .format('DDHHMM')}${dayJs().add(1, 'year').year()}.00`
        })
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CREATED);

      accessToken = await getAccessToken();

      //generate leave for this year
      await request(API_ENDPOINT)
        .post(`/employee/leave-request-type/generate-stock/${leaveType.id}`)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CREATED);

      //case carryForward; set year to next year Ex: 2026-02-20
      await request(API_ENDPOINT)
        .post('/authentication/system-test/set-date')
        .send({
          date: `${dayJs()
            .set('month', 0)
            .format(DEFAULT_MONTH_FORMAT)}${dayJs()
            .set('date', 30)
            .format('DDHHMM')}${dayJs().add(1, 'year').year()}.00`
        })
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CREATED);

      accessToken = await getAccessToken();
      //generate leave for next year
      await request(API_ENDPOINT)
        .post(`/employee/leave-request-type/generate-stock/${leaveType.id}`)
        .set(AUTHORIZATION_KEY, accessToken)
        .expect(HttpStatus.CREATED);

      const leaveTypeVariation: LeaveTypeVariation =
        await getEmployeeLeaveTypeVariation(
          accessToken,
          employeeId,
          LeaveTypeEnum.ANNUAL_LEAVE
        );

      const reasonTemplate: ReasonTemplate =
        await getReasonTemplateTypeOther(accessToken);

      //carry forward 6 and leave top up 1 with 18 days of annual leave = 25 days
      await requestAnnualLeaveWithCarryForward(
        employeeId,
        leaveTypeVariation.id,
        reasonTemplate.id,
        accessToken
      );

      //set date back to current date
      await setDateBackToCurrentDate(accessToken, currentDate);
    });
  });
});

export const requestAnnualLeaveExceedingProrateAndSuccess = async (
  employeeId: number,
  leaveRequestTypeId: number,
  reasonTemplateId: number,
  accessToken: string
) => {
  const createLeaveRequestDto: CreateLeaveRequestDto = {
    employeeId,
    leaveRequestTypeId,
    durationType: LeaveRequestDurationTypeEnEnum.DATE_RANGE,
    fromDate: dayJs()
      .set('month', 11)
      .set('date', 1)
      .format(DEFAULT_DATE_FORMAT),
    toDate: dayJs()
      .set('month', 11)
      .set('date', 20)
      .format(DEFAULT_DATE_FORMAT),
    documentIds: [],
    reason: 'From test.',
    reasonTemplateId,
    isPublicHoliday: false,
    isSpecialLeave: false
  };

  //get initial value of leave stock
  const { remaining: leaveDayRemaining } = await getLeaveStockWithValidateStock(
    employeeId,
    createLeaveRequestDto.fromDate,
    accessToken,
    LeaveTypeEnum.ANNUAL_LEAVE
  );

  // request annual leave over prorate allowance 19 days
  await request(API_ENDPOINT)
    .post('/employee/leave-request')
    .send(createLeaveRequestDto)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) =>
      expect(res.body.errors[0].message).toContain(
        'You cannot request leave more than 19 in a month.'
      )
    )
    .expect(HttpStatus.CONFLICT);

  // request leave for 18 days
  createLeaveRequestDto.toDate = dayJs()
    .set('month', 11)
    .set('date', 18)
    .format(DEFAULT_DATE_FORMAT);

  await request(API_ENDPOINT)
    .post('/employee/leave-request')
    .send(createLeaveRequestDto)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    })
    .expect(HttpStatus.CREATED);

  // request leave first half day and duplicate
  createLeaveRequestDto.fromDate = dayJs()
    .set('month', 11)
    .set('date', 19)
    .format(DEFAULT_DATE_FORMAT);
  createLeaveRequestDto.toDate = dayJs()
    .set('month', 11)
    .set('date', 19)
    .format(DEFAULT_DATE_FORMAT);
  createLeaveRequestDto.durationType =
    LeaveRequestDurationTypeEnEnum.FIRST_HALF_DAY;
  await createLeaveRequest(accessToken, createLeaveRequestDto);

  // request leave second half day and duplicate
  createLeaveRequestDto.durationType =
    LeaveRequestDurationTypeEnEnum.SECOND_HALF_DAY;
  await createLeaveRequest(accessToken, createLeaveRequestDto);

  // no more annual leave remaining, but special leave
  await getLeaveStockWithValidateStock(
    employeeId,
    createLeaveRequestDto.fromDate,
    accessToken,
    LeaveTypeEnum.ANNUAL_LEAVE,
    leaveDayRemaining
  );

  // request special leave for 4 days
  createLeaveRequestDto.durationType =
    LeaveRequestDurationTypeEnEnum.DATE_RANGE;
  createLeaveRequestDto.fromDate = dayJs()
    .set('month', 11)
    .set('date', 20)
    .format(DEFAULT_DATE_FORMAT);
  createLeaveRequestDto.toDate = dayJs()
    .set('month', 11)
    .set('date', 23)
    .format(DEFAULT_DATE_FORMAT);

  createLeaveRequestDto.isSpecialLeave = true;
  await request(API_ENDPOINT)
    .post('/employee/leave-request')
    .send(createLeaveRequestDto)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    })
    .expect(HttpStatus.CREATED);

  // request special leave for 4 days more, but expect errors
  createLeaveRequestDto.fromDate = dayJs()
    .set('month', 11)
    .set('date', 24)
    .format(DEFAULT_DATE_FORMAT);
  createLeaveRequestDto.toDate = dayJs()
    .set('month', 11)
    .set('date', 27)
    .format(DEFAULT_DATE_FORMAT);

  createLeaveRequestDto.isSpecialLeave = true;
  await request(API_ENDPOINT)
    .post('/employee/leave-request')
    .send(createLeaveRequestDto)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.errors[0].message).toContain(
        'You cannot request special leave more than 3 day(s)'
      );
    })
    .expect(HttpStatus.CONFLICT);

  // request special leave for 3 days more and success
  createLeaveRequestDto.toDate = dayJs()
    .set('month', 11)
    .set('date', 26)
    .format(DEFAULT_DATE_FORMAT);
  await request(API_ENDPOINT)
    .post('/employee/leave-request')
    .send(createLeaveRequestDto)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED);

  const { leaveTypeId, leaveStock } = await getLeaveStockWithValidateStock(
    employeeId,
    createLeaveRequestDto.fromDate,
    accessToken,
    LeaveTypeEnum.ANNUAL_LEAVE,
    leaveDayRemaining
  );

  await checkStockDetailAnnualLeave(
    accessToken,
    employeeId,
    leaveTypeId,
    createLeaveRequestDto.fromDate,
    leaveStock
  );
};

export const createLeaveRequest = async (
  accessToken: string,
  createLeaveRequestDto: CreateLeaveRequestDto
) => {
  await request(API_ENDPOINT)
    .post('/employee/leave-request')
    .send(createLeaveRequestDto)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    })
    .expect(HttpStatus.CREATED);

  // request duplicate leave first half day
  await request(API_ENDPOINT)
    .post('/employee/leave-request')
    .send(createLeaveRequestDto)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.errors[0].message).toContain(
        'You already requested leave for this day.'
      );
    })
    .expect(HttpStatus.CONFLICT);
};

export const requestAnnualLeaveWithCarryForward = async (
  employeeId: number,
  leaveRequestTypeId: number,
  reasonTemplateId: number,
  accessToken: string
) => {
  const createLeaveRequestDto: CreateLeaveRequestDto = {
    employeeId,
    leaveRequestTypeId,
    durationType: LeaveRequestDurationTypeEnEnum.DATE_RANGE,
    fromDate: dayJs()
      .set('month', 0)
      .set('date', 1)
      .format(DEFAULT_DATE_FORMAT),
    toDate: dayJs().set('month', 0).set('date', 9).format(DEFAULT_DATE_FORMAT),
    documentIds: [],
    reason: 'From test.',
    reasonTemplateId,
    isPublicHoliday: false,
    isSpecialLeave: false
  };

  //get initial value of leave stock
  const { remaining: leaveDayRemaining } = await getLeaveStockWithValidateStock(
    employeeId,
    createLeaveRequestDto.fromDate,
    accessToken,
    LeaveTypeEnum.ANNUAL_LEAVE
  );

  // request annual leave over prorate allowance 9 days, but in Jan total prorate is 8.5
  await request(API_ENDPOINT)
    .post('/employee/leave-request')
    .send(createLeaveRequestDto)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.errors[0].message).toContain(
        'You cannot request leave more than 8.5 in a month.'
      );
    })
    .expect(HttpStatus.CONFLICT);

  // request annual leave for 8 days, and expect it works fine
  createLeaveRequestDto.toDate = dayJs()
    .set('month', 0)
    .set('date', 8)
    .format(DEFAULT_DATE_FORMAT);

  await request(API_ENDPOINT)
    .post('/employee/leave-request')
    .send(createLeaveRequestDto)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED);

  // re-check stock
  const { leaveTypeId, leaveStock } = await getLeaveStockWithValidateStock(
    employeeId,
    createLeaveRequestDto.fromDate,
    accessToken,
    LeaveTypeEnum.ANNUAL_LEAVE,
    leaveDayRemaining
  );

  //validate stock detail
  await checkStockDetailCarryForward(
    accessToken,
    employeeId,
    leaveTypeId,
    createLeaveRequestDto.fromDate,
    leaveStock
  );
};

export const getLeaveStockWithValidateStock = async (
  employeeId: number,
  date: string,
  accessToken: string,
  type: LeaveTypeEnum,
  totalAllowancePerYear?: number
): Promise<{
  remaining: number;
  used: number;
  leaveTypeId: number;
  leaveStock: LeaveStock;
}> => {
  let leaveStockResponse: request.Response;
  if (totalAllowancePerYear) {
    leaveStockResponse = await request(API_ENDPOINT)
      .get(
        `/employee/leave-request/leave-stock/list?employeeId=${employeeId}&year=${dayJs(
          date
        ).get('year')}&month=${dayJs(date).get('month') + 1}`
      )
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => {
        const updatedLeaveStock = res.body.data
          .at(0)
          .leaveStock.find((item: any) => item.leaveType.name === type);

        // expect leave days used
        expect(updatedLeaveStock.leaveType.used).toEqual(
          Number(totalAllowancePerYear) -
            Number(updatedLeaveStock.leaveType.remaining)
        );

        // expect leave days remaining
        expect(updatedLeaveStock.leaveType.remaining).toEqual(
          Number(totalAllowancePerYear) -
            Number(updatedLeaveStock.leaveType.used)
        );
      })
      .expect(HttpStatus.OK);
  } else {
    leaveStockResponse = await request(API_ENDPOINT)
      .get(
        `/employee/leave-request/leave-stock/list?employeeId=${employeeId}&year=${dayJs(
          date
        ).get('year')}&month=${dayJs(date).format(DEFAULT_MONTH_FORMAT)}`
      )
      .set(AUTHORIZATION_KEY, accessToken)
      .expect((res) => expect(res.body.data.length).toBeGreaterThan(0))
      .expect(HttpStatus.OK);
  }

  const leaveStock = leaveStockResponse.body.data
    .at(0)
    .leaveStock.find((item: any) => item.leaveType.name === type);

  return {
    remaining: leaveStock?.leaveType?.remaining,
    used: leaveStock?.leaveType?.used,
    leaveTypeId: leaveStock?.leaveType?.id,
    leaveStock: leaveStock?.leaveStockInfo
  };
};

export const createEmployeeAndUpdateToPassProbation = async (
  accessToken: string
): Promise<number> => {
  //get company structure position
  const positionLevel = await getPositionLevelByName(
    PositionLevelTitleEnum.OFFICER,
    accessToken
  );
  const companyStructurePosition = await createCompanyStructureTree(
    positionLevel['id'],
    accessToken,
    false,
    PositionLevelTitleEnum.OFFICER
  );

  // create employee
  const startDate = dayJs()
    .set('month', 9)
    .set('date', 10)
    .subtract(4, 'year')
    .format(DEFAULT_DATE_FORMAT);

  const employeeId = await createEmployee(
    companyStructurePosition.id,
    accessToken,
    startDate
  );

  //update employee post probation
  await request(API_ENDPOINT)
    .put(`/employee/employee-master-information/${employeeId}/probation`)
    .send({ passProbationStatus: UpdateProbationEmployeeStatusEnum.ACTIVE })
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data.id).toEqual(employeeId);
    })
    .expect(HttpStatus.OK);

  return employeeId;
};

export const getLeaveTypeByEnum = async (
  accessToken: string,
  type: LeaveTypeEnum
): Promise<LeaveType> => {
  const response = await request(API_ENDPOINT)
    .get(`/employee/leave-request-type?keywords=${type}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      expect(res.body.data.length).toBeGreaterThan(0);
    })
    .expect(HttpStatus.OK);

  return response.body.data.at(0);
};

export const getReasonTemplateTypeOther = async (
  accessToken: string
): Promise<ReasonTemplate> => {
  const reasonTemplateResponse = await request(API_ENDPOINT)
    .get('/employee/reason-template')
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => expect(res.body.data.length).toBeGreaterThan(0))
    .expect(HttpStatus.OK);

  return reasonTemplateResponse.body.data.find(
    (reasonTemplate: ReasonTemplate) =>
      reasonTemplate.type === ReasonTemplateTypeEnum.OTHER
  );
};

export const getEmployeeLeaveTypeVariation = async (
  accessToken: string,
  employeeId: number,
  type: LeaveTypeEnum
): Promise<LeaveTypeVariation> => {
  const employeeLeaveTypeResponse = await request(API_ENDPOINT)
    .get(`/employee/leave-request-type/employee/${employeeId}`)
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => expect(res.body.data.length).toBeGreaterThan(0))
    .expect(HttpStatus.OK);

  return employeeLeaveTypeResponse.body.data.find(
    (leaveTypeVariation: LeaveTypeVariation) =>
      leaveTypeVariation.leaveType.leaveTypeName === type
  );
};

export const getCurrentDateMatchedServerFormat = (): string => {
  const currentDate = dayJs();

  return `${dayJs(currentDate).format(DEFAULT_MONTH_FORMAT)}${dayJs(
    currentDate
  ).format(DEFAULT_DAY_FORMAT)}${dayJs(currentDate).format('HHmm')}${dayJs(
    currentDate
  ).year()}.${dayJs(currentDate).format(DEFAULT_SECOND_FORMAT)}`;
};

export const setDateBackToCurrentDate = async (
  accessToken: string,
  date: string
) => {
  await request(API_ENDPOINT)
    .post('/authentication/system-test/set-date')
    .send({ date })
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED);
};

export const checkStockDetailCarryForward = async (
  accessToken: string,
  employeeId: number,
  leaveTypeId: number,
  date: string,
  leaveStock: LeaveStock
) => {
  await request(API_ENDPOINT)
    .get(
      `/employee/leave-request/leave-stock/list/detail/${leaveTypeId}/${employeeId}?month=${
        dayJs(date).month() + 1
      }&year=${dayJs(date).year()}`
    )
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      const response = res.body.data;

      //expect carry
      expect(response.carryForward.used).toEqual(
        Number(leaveStock.actualCarryForward)
      );
      expect(response.carryForward.allowance).toEqual(
        Number(leaveStock.actualCarryForward)
      );
      expect(response.carryForward.remaining).toEqual(
        Number(leaveStock.actualCarryForward) -
          Number(response.carryForward.used)
      );

      //expect prorate
      expect(response.proratePerMonth.used).toEqual(
        Number(leaveStock.policyProratePerMonth)
      );
      expect(response.proratePerMonth.allowance).toEqual(
        Number(leaveStock.policyProratePerMonth)
      );
      expect(response.proratePerMonth.remaining).toEqual(
        Number(leaveStock.policyProratePerMonth) -
          Number(response.proratePerMonth.used)
      );

      //expect leave top-up
      expect(response.allowanceTopUp.used).toEqual(0.5);
      expect(response.allowanceTopUp.allowance).toEqual(1);
      expect(response.allowanceTopUp.remaining).toEqual(0.5);
    });
};

export const checkStockDetailAnnualLeave = async (
  accessToken: string,
  employeeId: number,
  leaveTypeId: number,
  date: string,
  leaveStock: LeaveStock
) => {
  await request(API_ENDPOINT)
    .get(
      `/employee/leave-request/leave-stock/list/detail/${leaveTypeId}/${employeeId}?month=${
        dayJs(date).month() + 1
      }&year=${dayJs(date).year()}`
    )
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.OK)
    .expect((res) => {
      const response = res.body.data;

      //expect prorate
      expect(response.proratePerMonth.used).toEqual(
        Number(leaveStock.policyAllowancePerYear)
      );
      expect(response.proratePerMonth.allowance).toEqual(
        Number(leaveStock.policyAllowancePerYear)
      );
      expect(response.proratePerMonth.remaining).toEqual(
        Number(leaveStock.policyAllowancePerYear) -
          Number(response.proratePerMonth.used)
      );

      //expect special leave
      expect(response.specialLeave.used).toEqual(
        Number(leaveStock.policySpecialLeaveAllowanceDay) -
          Number(leaveStock.specialLeaveAllowanceDay)
      );
      expect(response.specialLeave.allowance).toEqual(
        Number(leaveStock.policySpecialLeaveAllowanceDay)
      );
      expect(response.specialLeave.remaining).toEqual(
        Number(leaveStock.specialLeaveAllowanceDay)
      );

      //expect leave top-up
      expect(response.allowanceTopUp.used).toEqual(
        Number(leaveStock.leaveDayTopUp) -
          Number(leaveStock.leaveDayTopUpRemaining)
      );
      expect(response.allowanceTopUp.allowance).toEqual(
        Number(leaveStock.leaveDayTopUp)
      );
      expect(response.allowanceTopUp.remaining).toEqual(
        Number(leaveStock.leaveDayTopUpRemaining)
      );
    });
};

export const checkStockDetailUnpaidLeave = async (
  accessToken: string,
  employeeId: number,
  leaveTypeId: number,
  date: string,
  used: number,
  remaining: number
) => {
  await request(API_ENDPOINT)
    .get(
      `/employee/leave-request/leave-stock/list/detail/${leaveTypeId}/${employeeId}?month=${
        dayJs(date).month() + 1
      }&year=${dayJs(date).year()}`
    )
    .set(AUTHORIZATION_KEY, accessToken)
    .expect((res) => {
      const response = res.body.data;

      //expect allowance per year
      expect(response.allowancePerYear.used).toEqual(used);
      expect(response.allowancePerYear.allowance).toEqual(used + remaining);
      expect(response.allowancePerYear.remaining).toEqual(remaining);
    });
};

export const createPublicHoliday = async (
  accessToken: string,
  date: string
) => {
  const name = uuidv4();
  await request(API_ENDPOINT)
    .post('/employee/public-holiday')
    .send({ name, date: date })
    .set(AUTHORIZATION_KEY, accessToken)
    .expect(HttpStatus.CREATED)
    .expect((res) => {
      expect(res.body.data.id).not.toBeNull();
    });
};
