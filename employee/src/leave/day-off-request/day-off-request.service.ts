import { Inject, Injectable } from '@nestjs/common';
import { Between, DataSource, FindOperator, ILike, In, Raw } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import * as _ from 'lodash';
import { ResourceConflictException } from '../../shared-resources/exception/conflict-resource.exception';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from '../../shared-resources/export-file/common/enum/data-table-name.enum';
import { validateByStatusActive } from '../../shared-resources/utils/validate-by-status.utils';
import { EmployeeProto } from '../../shared-resources/proto';
import {
  checkIsValidYearFormat,
  validateDateTime
} from '../../shared-resources/utils/validate-date-format';
import { StatusEnum } from '../../shared-resources/common/enums/status.enum';
import { ResourceNotFoundException } from '../../shared-resources/exception';
import { dayJs } from '../../shared-resources/common/utils/date-utils';
import { EntityParam } from '../../shared-resources/ts/interface/entity-params';
import { RequestWorkFlowTypeEnum } from '../../request-workflow-type/common/ts/enum/request-workflow-type.enum';
import {
  customRelationPositionAndTeam,
  customSelectPositionAndTeam
} from '../../../../auth/src/common/select-relation/custom-section-relation';
import { GrpcService } from '../../grpc/grpc.service';
import { UtilityService } from '../../utility/utility.service';
import { CreateApprovalStatusTrackingDto } from '../../approval-status-tracking/dto/create-approval-status-tracking.dto';
import { DEFAULT_DATE_FORMAT } from '../../shared-resources/common/dto/default-date-format';
import { ApprovalStatusTrackingValidationService } from '../../approval-status-tracking/approval-status-tracking-validation.service';
import { ValidationLeaveService } from '../common/validators/validation-leave.service';
import { GlobalConfigurationNameEnum } from '../../shared-resources/common/enum/global-configuration-name.enum';
import { ResourceBadRequestException } from '../../shared-resources/exception/badRequest.exception';
import { WorkShiftTypeEnum } from '../../workshift-type/common/ts/enum/workshift-type.enum';
import { ApprovalStatusEnum } from '../../approval-status-tracking/common/ts/enum/approval-status.enum';
import { IEmployeeRepository } from '../../employee/repository/interface/employee.repository.interface';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { AttendanceReportService } from '../../attendance/attendance-report/attendance-report.service';
import { MediaEntityTypeEnum } from '../../media/common/ts/enums/entity-type.enum';
import { EmployeeActiveStatusEnum } from '../../employee/enum/employee-status.enum';
import { dayOffRequestConstraint } from './../../shared-resources/ts/constants/resource-exception-constraints';
import { handleResourceConflictException } from './../../shared-resources/common/utils/handle-resource-conflict-exception';
import { CreateDayOffRequestDto } from './dto/create-day-off-request.dto';
import { UpdateDayOffRequestDto } from './dto/update-day-off-request.dto';
import {
  DayOffRequest,
  dayOffRequestSearchableColumns
} from './entities/day-off-request.entity';
import { PaginationDayOffRequestDto } from './dto/pagination-day-off-request.dto';
import { DayOffRequestRepository } from './repository/day-off-request.repository';
import { IDayOffRequestRepository } from './repository/interface/day-off-request.repository.interface';

@Injectable()
export class DayOffRequestService {
  private readonly DAY_OFF_REQUEST = 'Day off request';

  constructor(
    private readonly dataSource: DataSource,
    @Inject(DayOffRequestRepository)
    private readonly dayOffRequestRepo: IDayOffRequestRepository,
    private readonly grpcService: GrpcService,
    private readonly utilityService: UtilityService,
    private readonly approvalStatusValidationService: ApprovalStatusTrackingValidationService,
    private readonly validationLeaveService: ValidationLeaveService,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    private readonly attendanceReportService: AttendanceReportService
  ) {}

  findDayOffById = async (id: number) => {
    const dayOffREquest = await this.dayOffRequestRepo.findOne({
      where: { id },
      relations: { employee: true },
      select: { employee: { id: true, displayFullNameEn: true } }
    });

    if (!dayOffREquest) {
      throw new ResourceNotFoundException('day off request', id);
    }

    return dayOffREquest;
  };

  async validateRequestTime(createDayOffRequestDto: CreateDayOffRequestDto) {
    const scanTime = await this.grpcService.getGlobalConfigurationByName({
      name: 'allow-day-off-days'
    });

    const uniqueFirstDay = createDayOffRequestDto.dayOffDate.reduce(
      (prev, next) => {
        const date = dayJs(next).startOf('month').format(DEFAULT_DATE_FORMAT);

        if (prev[date]) {
          prev[date] += 1;
        } else {
          prev[date] = 1;
        }
        return prev;
      },
      {}
    );

    await Promise.all(
      _.map(uniqueFirstDay, async (dayCount, firstDayOfMonth) => {
        const firstDateOfMonth = dayJs(firstDayOfMonth)
          .utc(true)
          .startOf('month')
          .toDate();

        const lastDateOfMonth = dayJs(firstDayOfMonth)
          .utc(true)
          .endOf('month')
          .toDate();

        const existingCount = await this.dayOffRequestRepo.findAndCount({
          where: {
            employee: { id: createDayOffRequestDto.employeeId },
            dayOffDate: Between(firstDateOfMonth, lastDateOfMonth)
          }
        });

        const daysOffCount =
          Number(existingCount.indexOf(1)) + Number(dayCount);

        if (daysOffCount > Number(scanTime.value)) {
          throw new ResourceConflictException(
            this.DAY_OFF_REQUEST,
            `The employee cannot request days off more than ${scanTime.value} days`
          );
        }
      })
    );
  }

  async getConfigurationAllowedDayOff() {
    return await this.grpcService.getGlobalConfigurationByName({
      name: GlobalConfigurationNameEnum.ALLOW_DAY_OFF_DAYS
    });
  }

  /**
   * This function is used to get all day off request of employee in current month.
   * @param id
   */
  async getDayOffRequestInCurrentMonthByEmployeeId(
    id: number,
    dateTime: string
  ): Promise<DayOffRequest[]> {
    const fromDate: any = dayJs(dateTime)
      .utc(true)
      .startOf('month')
      .format(DEFAULT_DATE_FORMAT);

    const toDate: any = dayJs(dateTime)
      .utc(true)
      .endOf('month')
      .format(DEFAULT_DATE_FORMAT);

    return await this.dayOffRequestRepo.find({
      where: {
        employee: { id },
        dayOffDate: Between(fromDate, toDate),
        status: In([StatusEnum.PENDING, StatusEnum.ACTIVE])
      }
    });
  }

  /**
   *  Validate day off request of given employee in given month
   *  wether it exceeds the limit of number of days allowed in global configuration or not.
   * @param dayOffDays
   * @param employeeId
   */
  async checkTotalDayOffRequestEmployeeInCurrentMonth(
    dayOffDays: any,
    employeeId: number
  ) {
    if (dayOffDays.length) {
      const firstDayOff = dayOffDays.at(0);
      dayOffDays.forEach((day: any) => {
        if (!dayJs(firstDayOff).isSame(day, 'month')) {
          throw new ResourceBadRequestException(
            'Day off request',
            `You are not allowed to request day off with days in different month.`
          );
        }
      });
    }

    const globalConfiguration = await this.getConfigurationAllowedDayOff();
    const dayOffRequest = await this.getDayOffRequestInCurrentMonthByEmployeeId(
      employeeId,
      dayOffDays.at(0)
    );

    const totalRequestDaysInCurrentMonth =
      Number(dayOffDays.length) + Number(dayOffRequest.length);

    if (totalRequestDaysInCurrentMonth > Number(globalConfiguration.value)) {
      throw new ResourceBadRequestException(
        'Day off request',
        `You are not allowed to request day off exceed ${globalConfiguration.value} days per month.`
      );
    }
  }

  async create(createDayOffRequestDto: CreateDayOffRequestDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const employee = await this.employeeRepo.getEmployeeById(
        createDayOffRequestDto.employeeId
      );

      await this.checkTotalDayOffRequestEmployeeInCurrentMonth(
        createDayOffRequestDto.dayOffDate,
        createDayOffRequestDto.employeeId
      );

      if (
        employee.workingShiftId.workshiftType.name !==
          WorkShiftTypeEnum.ROSTER ||
        !employee?.workingShiftId
      ) {
        throw new ResourceConflictException(
          this.DAY_OFF_REQUEST,
          `Only roster employee type can request day off.`
        );
      }

      await this.validateRequestTime(createDayOffRequestDto);
      const isAdmin = await this.utilityService.checkIsAdmin();

      let result: any;
      if (!isAdmin) {
        result = await this.utilityService.validateWithWorkflow(
          employee,
          RequestWorkFlowTypeEnum.DAY_OFF_REQUEST
        );
      }

      for (const item of createDayOffRequestDto.dayOffDate) {
        await this.validationLeaveService.validationExistingModifyLeave(
          RequestWorkFlowTypeEnum.DAY_OFF_REQUEST,
          createDayOffRequestDto.employeeId,
          { fromDate: item, toDate: item }
        );
      }

      const createdDayOffRequests: DayOffRequest[] = [];
      let newDayOffRequest: DayOffRequest;
      for (const dayOffReq of createDayOffRequestDto.dayOffDate) {
        const dateTime = validateDateTime(dayOffReq);
        const dayOffRequest = queryRunner.manager.create(DayOffRequest, {
          employee: { id: employee.id },
          dayOffDate: dateTime,
          status: isAdmin ? StatusEnum.ACTIVE : StatusEnum.PENDING
        });
        newDayOffRequest = await queryRunner.manager.save(dayOffRequest);
        createdDayOffRequests.push(newDayOffRequest);

        //* (result.id) get last id of record (because we insert multi record)
        if (!isAdmin) {
          const approvalStatusDto: CreateApprovalStatusTrackingDto = {
            approvalWorkflowId: result.requestApprovalWorkflowId,
            requestWorkflowTypeId: result.workflowTypeId,
            entityId: newDayOffRequest.id,
            requestToUpdateBy: null,
            requestToUpdateChange: null,
            requestToUpdateJson: null,
            firstApprovalUserId: null,
            secondApprovalUserId: null,
            status: ApprovalStatusEnum.PENDING
          };

          this.utilityService.createApprovalStatus(
            approvalStatusDto,
            result.requesterPosition,
            employee.id
          );
        }
      }
      await queryRunner.commitTransaction();

      //#region Re-generate attendance report for back date requests
      if (isAdmin) {
        for (const dayOffRequest of createdDayOffRequests) {
          await this.attendanceReportService.recalculateAttendanceReportForBackDateRequest(
            employee.id,
            dayOffRequest.dayOffDate
          );
        }
      }
      //#end regenerate

      return newDayOffRequest;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      handleResourceConflictException(
        exception,
        dayOffRequestConstraint,
        createDayOffRequestDto
      );
    } finally {
      queryRunner.release();
    }
  }

  async exportFile(
    pagination: PaginationDayOffRequestDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.DAY_OFF_REQUEST,
      exportFileDto,
      data
    );
  }

  async findAll(pagination: PaginationDayOffRequestDto) {
    if (pagination.fromDate || pagination.toDate) {
      if (pagination.fromDate && !pagination.toDate) {
        throw new ResourceNotFoundException(
          `You need to add query fromDate and toDate format(YYYY-MM-DD)`
        );
      }
    }
    if (pagination.toDate && !pagination.fromDate) {
      throw new ResourceNotFoundException(
        `You need to add query fromDate and toDate format(YYYY-MM-DD)`
      );
    }
    if (pagination.fromDate) {
      checkIsValidYearFormat(pagination.fromDate, DEFAULT_DATE_FORMAT);
    }

    if (pagination.toDate) {
      checkIsValidYearFormat(pagination.toDate, DEFAULT_DATE_FORMAT);
    }

    const employeeIds: number[] = await this.utilityService.getCurrentUserMpath(
      pagination.employeeId
    );

    const checkStatus =
      typeof pagination.status === `object`
        ? In(pagination.status)
        : pagination.status;

    let createdAtCondition: FindOperator<Date> | undefined;
    if (pagination.createdFromDate && pagination.createdToDate) {
      createdAtCondition = Raw(
        (createdAt) =>
          `(TO_CHAR(${createdAt}, '${DEFAULT_DATE_FORMAT}') BETWEEN '${pagination.createdFromDate}' AND '${pagination.createdToDate}')`
      );
    }

    let createdByCondition = pagination.createdByUserId as unknown as
      | FindOperator<number>
      | number;

    if (pagination.createdByEmployeeId && pagination.createdByUserId) {
      const employee = await this.employeeRepo.getEmployeeByIdForQuery(
        pagination.createdByUserId
      );

      createdByCondition = Raw(
        (createdBy) =>
          `(${createdBy} = '${employee?.userId}' AND ${createdBy} = '${pagination?.createdByUserId}')`
      );
    } else if (pagination.createdByEmployeeId) {
      const employee = await this.employeeRepo.getEmployeeByIdForQuery(
        pagination.createdByEmployeeId
      );
      createdByCondition = employee.userId;
    }

    return await this.dayOffRequestRepo.findAllWithPagination(
      pagination,
      dayOffRequestSearchableColumns,
      {
        where: {
          createdAt: createdAtCondition,
          createdBy: createdByCondition,
          employee: {
            id: In(employeeIds),
            status: In(Object.values(EmployeeActiveStatusEnum)),
            positions: {
              isMoved: false,
              isDefaultPosition: true,
              companyStructureCompany: {
                id: pagination.companyId
              },
              companyStructureLocation: {
                id: pagination.locationId
              },
              companyStructureDepartment: {
                id: pagination.departmentId
              },
              companyStructureOutlet: {
                id: pagination.outletId
              },
              companyStructureTeam: {
                id: pagination.teamId
              },
              companyStructurePosition: {
                id: pagination.positionId
              }
            },
            displayFullNameEn: pagination.displayFullNameEn
              ? ILike(`%${pagination.displayFullNameEn}%`)
              : null,
            accountNo: pagination.accountNo
              ? ILike(`%${pagination.accountNo}%`)
              : null
          },
          dayOffDate:
            pagination.fromDate && pagination.toDate
              ? Between(
                  dayJs(pagination.fromDate).toDate(),
                  dayJs(pagination.toDate).toDate()
                )
              : null,
          status: checkStatus ?? StatusEnum.ACTIVE
        },
        relation: { employee: customRelationPositionAndTeam },
        select: { employee: customSelectPositionAndTeam },
        mapFunction: async (dayOffRequests: DayOffRequest) => {
          if (dayOffRequests.employee) {
            const employee = dayOffRequests.employee;
            return {
              ...dayOffRequests,
              createdBy:
                await this.employeeRepo.getEmployeeWithUserTemplateByUserId(
                  dayOffRequests.createdBy
                ),
              employee: {
                id: employee.id,
                displayFullNameEn: employee.displayFullNameEn,
                gender: employee.gender.value,
                startDate: employee.startDate,
                accountNo: employee.accountNo,
                dob: employee.dob,
                email: employee.email,
                mpath: employee.positions[0].mpath,
                maritalStatus: employee.maritalStatus.value,
                isDefaultPosition:
                  employee?.positions?.at(0)?.isDefaultPosition,
                location:
                  employee.positions[0].companyStructureLocation
                    .companyStructureComponent.name,
                outlet:
                  employee.positions[0].companyStructureOutlet
                    .companyStructureComponent.name,
                department:
                  employee.positions[0].companyStructureDepartment
                    .companyStructureComponent.name,
                team:
                  employee.positions[0].companyStructureTeam !== null
                    ? employee.positions[0].companyStructureTeam
                        .companyStructureComponent.name
                    : null,
                position:
                  employee.positions[0].companyStructurePosition
                    .companyStructureComponent.name
              }
            };
          }
        }
      }
    );
  }

  async findOne(id: number) {
    return await this.findDayOffById(id);
  }

  async update(id: number, updateDayOffRequestDto: UpdateDayOffRequestDto) {
    try {
      const dayOffRequest = await this.findDayOffById(id);
      validateByStatusActive(dayOffRequest.status);

      // check if current user is creator or not.
      await this.utilityService.checkCurrentUserIsCreatorOrNot(
        dayOffRequest.createdBy
      );

      // validation existing
      for (const dayOffDate of updateDayOffRequestDto.dayOffDate) {
        await this.validationLeaveService.validationExistingModifyLeave(
          RequestWorkFlowTypeEnum.DAY_OFF_REQUEST,
          updateDayOffRequestDto.employeeId,
          {
            fromDate: dayOffDate,
            toDate: dayOffDate
          }
        );
      }

      for (const dayOffDateRequest of updateDayOffRequestDto.dayOffDate) {
        const dayOffDate = validateDateTime(dayOffDateRequest);
        const dayOffRequest = await this.dayOffRequestRepo.findOneBy({
          id
        });

        if (!dayOffRequest) {
          throw new ResourceNotFoundException(this.DAY_OFF_REQUEST, id);
        }

        dayOffRequest.dayOffDate = dayOffDate;
        return await this.dayOffRequestRepo.save(dayOffRequest);
      }
    } catch (exception) {
      handleResourceConflictException(
        exception,
        dayOffRequestConstraint,
        updateDayOffRequestDto
      );
    }
  }

  async delete(id: number) {
    await this.approvalStatusValidationService.deleteEntityById(
      id,
      MediaEntityTypeEnum.DAY_OFF_REQUEST
    );
  }

  async grpcUpdateStatus(request: EmployeeProto.EmployeeStatusParams) {
    const dayOffRequest = await this.dayOffRequestRepo.findOne({
      where: { id: request.id },
      relations: { employee: true }
    });
    if (!dayOffRequest) {
      throw new RpcException({
        message: `Resource day off request of ${request.id} not found`,
        code: 5
      });
    }
    await this.dayOffRequestRepo.save(
      Object.assign(dayOffRequest, { status: request.status })
    );

    if (request.status === ApprovalStatusEnum.ACTIVE) {
      await this.attendanceReportService.recalculateAttendanceReportForBackDateRequest(
        dayOffRequest.employee.id,
        dayOffRequest.dayOffDate
      );
    }

    return { employeeId: dayOffRequest.employee.id };
  }

  async findOneByEntityId(requestDto: EntityParam) {
    const dayOffRequest = await this.dayOffRequestRepo.findOne({
      where: {
        id: requestDto.id,
        employee: {
          id: requestDto.employeeId || null,
          displayFullNameEn: requestDto.employeeName
            ? ILike(`%${requestDto.employeeName}%`)
            : null,
          status: In(Object.values(EmployeeActiveStatusEnum)),
          positions: {
            isMoved: false,
            isDefaultPosition: true,
            companyStructurePosition: {
              id: requestDto.positionId ? requestDto.positionId : null
            },
            companyStructureOutlet: {
              id: requestDto.outletId ? requestDto.outletId : null
            },
            companyStructureDepartment: {
              id: requestDto.departmentId ? requestDto.departmentId : null
            },
            companyStructureLocation: {
              id: requestDto.locationId ? requestDto.locationId : null
            },
            companyStructureTeam: {
              id: requestDto.teamId ? requestDto.teamId : null
            }
          }
        }
      },
      relations: {
        employee: {
          positions: {
            companyStructureCompany: { companyStructureComponent: true },
            companyStructureLocation: { companyStructureComponent: true },
            companyStructureOutlet: { companyStructureComponent: true },
            companyStructureDepartment: { companyStructureComponent: true },
            companyStructurePosition: { companyStructureComponent: true },
            companyStructureTeam: { companyStructureComponent: true }
          },
          contacts: true
        }
      },
      select: {
        employee: {
          id: true,
          firstNameEn: true,
          lastNameEn: true,
          displayFullNameEn: true,
          startDate: true,
          email: true,
          accountNo: true,
          positions: {
            id: true,
            isDefaultPosition: true,
            companyStructureCompany: {
              id: true,
              companyStructureComponent: { id: true, name: true }
            },
            companyStructureLocation: {
              id: true,
              companyStructureComponent: { id: true, name: true }
            },
            companyStructureOutlet: {
              id: true,
              companyStructureComponent: { id: true, name: true }
            },
            companyStructureDepartment: {
              id: true,
              companyStructureComponent: { id: true, name: true }
            },
            companyStructurePosition: {
              id: true,
              companyStructureComponent: { id: true, name: true }
            }
          },
          contacts: { id: true, contact: true }
        }
      }
    });
    if (!dayOffRequest) {
      return null;
    }
    return {
      id: dayOffRequest.id,
      firstNameEn: dayOffRequest.employee.firstNameEn,
      lastNameEn: dayOffRequest.employee.lastNameEn,
      phone: dayOffRequest.employee.contacts[0].contact,
      email: dayOffRequest.employee.email,
      accountNo: dayOffRequest.employee.accountNo,
      location:
        dayOffRequest.employee.positions[0].companyStructureLocation
          .companyStructureComponent.name,
      outlet:
        dayOffRequest.employee.positions[0].companyStructureOutlet
          .companyStructureComponent.name,
      department:
        dayOffRequest.employee.positions[0].companyStructureDepartment
          .companyStructureComponent.name,
      position:
        dayOffRequest.employee.positions[0].companyStructurePosition
          .companyStructureComponent.name,
      displayFullNameEn: dayOffRequest.employee.displayFullNameEn,
      employeeId: dayOffRequest.employee ? dayOffRequest.employee.id : null
    };
  }

  async grpcGetDayOff(fromDate: Date, toDate: Date): Promise<DayOffRequest[]> {
    return this.dayOffRequestRepo.find({
      where: {
        dayOffDate: Between(fromDate, toDate),
        status: StatusEnum.ACTIVE
      },
      relations: { employee: true }
    });
  }
}
