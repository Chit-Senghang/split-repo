import { Between, DataSource, FindOperator, Raw } from 'typeorm';
import { Inject } from '@nestjs/common';
import { dayJs } from '../../../shared-resources/common/utils/date-utils';
import { LeaveRequest } from '../../leave-request/entities/leave-request.entity';
import { MissionRequest } from '../../mission-request/entities/mission-request.entity';
import {
  DAY_OFF_REQUEST,
  ERROR_MESSAGE,
  LEAVE_REQUEST,
  MISSION_REQUEST,
  SELF_DUPLICATE_ERROR_MESSAGE
} from '../constants/leave-error-message.constant';
import { RequestWorkFlowTypeEnum } from '../../../request-workflow-type/common/ts/enum/request-workflow-type.enum';
import { MissionRequestDurationTypeEnEnum } from '../../mission-request/enum/mission-request-duration-type.enum';
import { LeaveRequestDurationTypeEnEnum } from '../../leave-request/enums/leave-request-duration-type.enum';
import { DayOffRequestRepository } from '../../day-off-request/repository/day-off-request.repository';
import { IDayOffRequestRepository } from '../../day-off-request/repository/interface/day-off-request.repository.interface';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATE_TIME_FORMAT
} from '../../../shared-resources/common/dto/default-date-format';
import { StatusEnum } from './../../../shared-resources/common/enums/status.enum';
import { ResourceConflictException } from './../../../shared-resources/exception/conflict-resource.exception';
import { DayOffRequest } from './../../day-off-request/entities/day-off-request.entity';

export class ValidationLeaveService {
  constructor(
    @Inject(DayOffRequestRepository)
    private readonly dayOffRequestRepo: IDayOffRequestRepository,
    private readonly dataSource: DataSource
  ) {}

  async validationExistingModifyLeave(
    leaveType: RequestWorkFlowTypeEnum,
    employeeId: number,
    option: {
      durationType?:
        | MissionRequestDurationTypeEnEnum
        | LeaveRequestDurationTypeEnEnum;
      fromDate: string;
      toDate: string;
    }
  ) {
    // check existing day-off request
    const from: any = dayJs(option.fromDate).format(DEFAULT_DATE_FORMAT);
    const to: any = dayJs(option.toDate).format(DEFAULT_DATE_FORMAT);

    const dayOffRequest: DayOffRequest = await this.dayOffRequestRepo.findOne({
      where: {
        employee: {
          id: employeeId
        },
        dayOffDate: Between(from, to),
        status: StatusEnum.ACTIVE
      }
    });

    // check existing leave request
    const leaveRequest: LeaveRequest = await this.dataSource
      .getRepository(LeaveRequest)
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee')
      .where(
        `employee.id = :empId AND 
          leave.status = :statusCode AND
          ((leave.from_date BETWEEN :from AND :to)
          OR (leave.to_date BETWEEN :from AND :to)
          OR (leave.from_date <= :from AND leave.to_date >= :to))`,
        { from, to, empId: employeeId, statusCode: StatusEnum.ACTIVE }
      )
      .getOne();

    // check existing mission request
    const mission = await this.checkExistingMissionRequest(
      option,
      employeeId,
      from,
      to
    );

    this.handleErrorResponseMessage(
      leaveType,
      dayOffRequest,
      mission,
      leaveRequest,
      option.durationType
    );
  }

  private async checkExistingMissionRequest(
    option: any,
    employeeId: number,
    from: string,
    to: string
  ): Promise<MissionRequest> {
    let fromDateCondition:
      | NonNullable<string | Date>
      | FindOperator<NonNullable<string | Date>>;
    let toDateCondition:
      | NonNullable<string | Date>
      | FindOperator<NonNullable<string | Date>>;

    if (option.durationType === MissionRequestDurationTypeEnEnum.TIME) {
      from = dayJs(option.fromDate).format(DEFAULT_DATE_TIME_FORMAT);
      to = dayJs(option.toDate).format(DEFAULT_DATE_TIME_FORMAT);

      fromDateCondition = Raw(
        (fromDate) =>
          `(${fromDate} BETWEEN '${from}' AND '${to}' OR ${fromDate} <= '${from}')`
      );
      toDateCondition = Raw(
        (toDate) =>
          `(${toDate} BETWEEN '${from}' AND '${to}' OR ${toDate} >= '${to}')`
      );
    } else {
      fromDateCondition = Raw(
        (fromDate) =>
          `(TO_CHAR(${fromDate}, 'YYYY-MM-DD') BETWEEN '${from}' AND '${to}' OR ${fromDate} <= '${from}')`
      );

      toDateCondition = Raw(
        (toDate) =>
          `(TO_CHAR(${toDate}, 'YYYY-MM-DD') BETWEEN '${from}' AND '${to}' OR ${toDate} >= '${to}')`
      );
    }

    // check existing mission request
    return await this.dataSource.getRepository(MissionRequest).findOne({
      where: [
        {
          employee: { id: employeeId },
          status: StatusEnum.ACTIVE,
          fromDate: fromDateCondition,
          toDate: toDateCondition
        }
      ]
    });
  }

  private handleErrorResponseMessage(
    fromServices: RequestWorkFlowTypeEnum, // can be leave request, day off request, or mission request.
    dayOffRequestExist: DayOffRequest,
    missionRequestExist: MissionRequest,
    leaveRequestExist: LeaveRequest,
    duration: any
  ) {
    const leaveDurationType =
      duration ?? LeaveRequestDurationTypeEnEnum.DATE_RANGE;

    let hasMissionRequest = !!missionRequestExist;
    const missionDurationTypes = [
      MissionRequestDurationTypeEnEnum.FIRST_HALF_DAY,
      MissionRequestDurationTypeEnEnum.SECOND_HALF_DAY
    ];
    if (missionDurationTypes.includes(duration)) {
      hasMissionRequest = missionRequestExist?.durationType === duration;
    }

    const hasLeaveRequest =
      leaveRequestExist?.durationType === leaveDurationType;

    if (dayOffRequestExist && hasMissionRequest && hasLeaveRequest) {
      throw new ResourceConflictException(
        fromServices,
        `${ERROR_MESSAGE} ${MISSION_REQUEST}, ${DAY_OFF_REQUEST} and ${LEAVE_REQUEST}.`
      );
    } else if (dayOffRequestExist && hasMissionRequest) {
      throw new ResourceConflictException(
        fromServices,
        `${ERROR_MESSAGE} ${MISSION_REQUEST} and ${DAY_OFF_REQUEST}.`
      );
    } else if (dayOffRequestExist && hasLeaveRequest) {
      throw new ResourceConflictException(
        fromServices,
        `${ERROR_MESSAGE} ${DAY_OFF_REQUEST} and ${LEAVE_REQUEST}.`
      );
    } else if (hasMissionRequest && hasLeaveRequest) {
      throw new ResourceConflictException(
        fromServices,
        `${ERROR_MESSAGE} ${MISSION_REQUEST} and ${LEAVE_REQUEST}.`
      );
    } else if (dayOffRequestExist) {
      throw new ResourceConflictException(
        fromServices,
        fromServices === RequestWorkFlowTypeEnum.DAY_OFF_REQUEST
          ? SELF_DUPLICATE_ERROR_MESSAGE
          : `${ERROR_MESSAGE} ${DAY_OFF_REQUEST}.`
      );
    } else if (hasMissionRequest) {
      throw new ResourceConflictException(
        fromServices,
        fromServices === RequestWorkFlowTypeEnum.MISSION_REQUEST
          ? SELF_DUPLICATE_ERROR_MESSAGE
          : `${ERROR_MESSAGE} ${MISSION_REQUEST}.`
      );
    } else if (hasLeaveRequest) {
      throw new ResourceConflictException(
        fromServices,
        fromServices === RequestWorkFlowTypeEnum.LEAVE_REQUEST
          ? SELF_DUPLICATE_ERROR_MESSAGE
          : `${ERROR_MESSAGE} ${LEAVE_REQUEST}.`
      );
    }
  }
}
