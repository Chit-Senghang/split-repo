import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Between, FindOperator, ILike, In, QueryRunner, Raw } from 'typeorm';
import { Dayjs } from 'dayjs';
import { validateByStatusActive } from '../../shared-resources/utils/validate-by-status.utils';
import { OvertimeTypeEnum } from '../../shared-resources/common/enums/overtime-type.enum';
import { ResourceBadRequestException } from '../../shared-resources/exception/badRequest.exception';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from '../../shared-resources/export-file/common/enum/data-table-name.enum';
import { ResourceConflictException } from '../../shared-resources/exception/conflict-resource.exception';
import { GlobalConfigurationNameEnum } from '../../shared-resources/common/enum/global-configuration-name.enum';
import {
  dayJs,
  isSunday
} from '../../shared-resources/common/utils/date-utils';
import { DayOffRequest } from '../../leave/day-off-request/entities/day-off-request.entity';
import { WorkShiftTypeEnum } from '../../workshift-type/common/ts/enum/workshift-type.enum';
import { ResourceNotFoundException } from '../../shared-resources/exception/resource-not-found.exception';
import { StatusEnum } from '../../shared-resources/common/enums/status.enum';
import { EmployeeProto } from '../../shared-resources/proto';
import {
  checkIsValidYearFormat,
  validateDateTime,
  validateDateTimeFormat,
  validateTimeWithFormat
} from '../../shared-resources/utils/validate-date-format';
import { PaginationResponse } from '../../shared-resources/ts/interface/response.interface';
import { Employee } from '../../employee/entity/employee.entity';
import {
  customRelationPositionAndTeam,
  customSelectPositionAndTeam
} from '../../../../auth/src/common/select-relation/custom-section-relation';
import { RequestWorkFlowTypeEnum } from '../../request-workflow-type/common/ts/enum/request-workflow-type.enum';
import { UtilityService } from '../../utility/utility.service';
import { CreateApprovalStatusTrackingDto } from '../../approval-status-tracking/dto/create-approval-status-tracking.dto';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_HOUR_MINUTE_FORMAT
} from '../../shared-resources/common/dto/default-date-format';
import { ApprovalStatusTrackingValidationService } from '../../approval-status-tracking/approval-status-tracking-validation.service';
import { MediaEntityTypeEnum } from '../../media/common/ts/enums/entity-type.enum';
import { AttendanceRecord } from '../attendance-record/entities/attendance-record.entity';
import { MediaService } from '../../media/media.service';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { IEmployeeRepository } from '../../employee/repository/interface/employee.repository.interface';
import { GrpcService } from '../../grpc/grpc.service';
import { LeaveRequest } from '../../leave/leave-request/entities/leave-request.entity';
import { PublicHoliday } from '../public-holiday/entities/public-holiday.entity';
import { EmployeeWorkingScheduleRepository } from '../../employee-working-schedule/repository/employee-working-schedule.repository';
import { IEmployeeWorkingScheduleRepository } from '../../employee-working-schedule/repository/interface/employee-working-schedule.repository.interface';
import { IAttendanceRecordRepository } from '../attendance-record/repository/interface/attendance-record.interface';
import { EmployeeWorkingSchedule } from '../../employee-working-schedule/entities/employee-working-schedule.entity';
import { DayOffRequestRepository } from '../../leave/day-off-request/repository/day-off-request.repository';
import { IDayOffRequestRepository } from '../../leave/day-off-request/repository/interface/day-off-request.repository.interface';
import { PublicHolidayRepository } from '../public-holiday/repository/public-holiday.repository';
import { IPublicHolidayRepository } from '../public-holiday/repository/interface/public-holiday.repository.interface';
import { EmployeePosition } from '../../employee-position/entities/employee-position.entity';
import { ApprovalStatusEnum } from '../../approval-status-tracking/common/ts/enum/approval-status.enum';
import { AttendanceReportRepository } from '../attendance-report/repository/attendance-report.repository';
import { IAttendanceReportRepository } from '../attendance-report/repository/interface/attendance-report.repository.interface';
import { AttendanceReport } from '../attendance-report/entities/attendance-report.entity';
import { AttendanceReportStatusEnum } from '../attendance-report/enum/attendance-report-status.enum';
import { LeaveRequestDurationTypeEnEnum } from '../../leave/leave-request/enums/leave-request-duration-type.enum';
import { WorkingShift } from '../../workshift-type/entities/working-shift.entity';
import { AttendanceReportService } from '../attendance-report/attendance-report.service';
import { AttendanceRecordRepository } from '../attendance-record/repository/attendance-record.repository';
import { EmployeeActiveStatusEnum } from '../../employee/enum/employee-status.enum';
import { CreateOvertimeRequestDto } from './dto/create-overtime_request.dto';
import { UpdateOvertimeRequestDto } from './dto/update-overtime-request.dto';
import {
  OvertimeRequest,
  overTimeRequestSearchableColumns
} from './entities/overtime-request.entity';
import { OvertimeRequestRepository } from './repository/overtime-request.repository';
import { IOvertimeRequestRepository } from './repository/interface/overtime-request.repository.interface';
import { PaginationQueryOvertimeRequestDto } from './dto/pagination-query-overtime-request';

@Injectable()
export class OvertimeRequestService {
  private readonly OVERTIME_REQUEST: string = 'overtime request';

  constructor(
    @Inject(OvertimeRequestRepository)
    private readonly overtimeRequestRepo: IOvertimeRequestRepository,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(EmployeeWorkingScheduleRepository)
    private readonly employeeWorkingScheduleRepo: IEmployeeWorkingScheduleRepository,
    @Inject(AttendanceRecordRepository)
    private readonly attendanceRecordRepo: IAttendanceRecordRepository,
    @Inject(AttendanceReportRepository)
    private readonly attendanceReportRepo: IAttendanceReportRepository,
    @Inject(DayOffRequestRepository)
    private readonly dayOffRequestRepo: IDayOffRequestRepository,
    @Inject(PublicHolidayRepository)
    private readonly publicHolidayRepo: IPublicHolidayRepository,
    private readonly utilityService: UtilityService,
    private readonly mediaService: MediaService,
    private readonly attendanceReportService: AttendanceReportService,
    private readonly approvalStatusValidationService: ApprovalStatusTrackingValidationService,
    private readonly grpcService: GrpcService
  ) {}

  // ==========================================[ Public Methods ]==========================================
  async update(
    id: number,
    updateOvertimeRequestDto: UpdateOvertimeRequestDto
  ): Promise<OvertimeRequest> {
    return await this.overtimeRequestRepo.runTransaction(
      async (queryRunner): Promise<OvertimeRequest> => {
        const overtimeRequest: any = await this.validateUpdateOnActiveRequest({
          id,
          employeeId: updateOvertimeRequestDto.employeeId
        });

        // validate reason template and check type OTHER without reason throw error.
        await this.utilityService.validateTypeOtherInReasonTemplate(
          updateOvertimeRequestDto.reasonTemplateId ??
            overtimeRequest.reasonTemplate.id,
          updateOvertimeRequestDto.reason
        );

        // check if current user is creator or not.
        await this.utilityService.checkCurrentUserIsCreatorOrNot(
          overtimeRequest.createdBy
        );

        if (updateOvertimeRequestDto.startTime) {
          checkIsValidYearFormat(
            updateOvertimeRequestDto.startTime,
            DEFAULT_HOUR_MINUTE_FORMAT
          );
        }
        if (updateOvertimeRequestDto.endTime) {
          checkIsValidYearFormat(
            updateOvertimeRequestDto.endTime,
            DEFAULT_HOUR_MINUTE_FORMAT
          );
        }

        const requestDate = updateOvertimeRequestDto.requestDate
          ? validateDateTime(updateOvertimeRequestDto.requestDate)
          : overtimeRequest.requestDate;
        const updatedOvertimeRequest = await queryRunner.manager.save(
          Object.assign(overtimeRequest, {
            ...updateOvertimeRequestDto,
            reasonTemplate: { id: updateOvertimeRequestDto.reasonTemplateId },
            employee: { id: updateOvertimeRequestDto.employeeId },
            requestDate,
            startDate: updateOvertimeRequestDto.startTime,
            endDate: updateOvertimeRequestDto.endTime
          })
        );

        //Update or delete media by given documentIds
        if (updatedOvertimeRequest && updateOvertimeRequestDto?.documentIds) {
          const documentIds = updateOvertimeRequestDto.documentIds;
          await this.utilityService.updateMediaEntityIdAndType(
            documentIds,
            updatedOvertimeRequest.id,
            MediaEntityTypeEnum.OVERTIME_REQUEST,
            queryRunner
          );
        }
        //End

        return updatedOvertimeRequest;
      }
    );
  }

  async create(
    createOvertimeRequestDto: CreateOvertimeRequestDto
  ): Promise<OvertimeRequest> {
    const { createdOverTimeRequest, isAdmin } =
      await this.overtimeRequestRepo.runTransaction(
        async (
          queryRunner: QueryRunner
        ): Promise<{
          createdOverTimeRequest: OvertimeRequest;
          isAdmin: boolean;
        }> => {
          const {
            employee,
            requestDate,
            isAdmin,
            requesterPosition,
            createApprovalStatusTrackingDto
          } = await this.validateCreateOvertimeRequestDto(
            createOvertimeRequestDto
          );

          const workingShift = employee.workingShiftId;
          const workingShiftType = workingShift.workshiftType.name;

          let startTime = createOvertimeRequestDto.startTime;
          let endTime = createOvertimeRequestDto.endTime;

          if (
            createOvertimeRequestDto.overtimeType ===
            OvertimeTypeEnum.WORKING_SHIFT
          ) {
            let shiftStart = dayJs(
              `${createOvertimeRequestDto.requestDate} ${workingShift.startWorkingTime}`
            );
            startTime = shiftStart.format(DEFAULT_HOUR_MINUTE_FORMAT);

            let shiftEnd = dayJs(
              `${createOvertimeRequestDto.requestDate} ${workingShift.endWorkingTime}`
            );
            endTime = shiftEnd.format(DEFAULT_HOUR_MINUTE_FORMAT);

            if (workingShiftType !== WorkShiftTypeEnum.ROSTER) {
              const workingSchedule = await this.findWorkingSchedule(
                employee.id,
                employee.fingerPrintId
              );

              shiftStart = dayJs(
                `${createOvertimeRequestDto.requestDate} ${workingSchedule.startWorkingTime}`
              );
              startTime = shiftStart.format(DEFAULT_HOUR_MINUTE_FORMAT);

              shiftEnd = dayJs(
                `${createOvertimeRequestDto.requestDate} ${workingSchedule.endWorkingTime}`
              );
              endTime = shiftEnd.format(DEFAULT_HOUR_MINUTE_FORMAT);
            }
          }

          const overTimeRequest = this.overtimeRequestRepo.create({
            ...createOvertimeRequestDto,
            startTime: startTime,
            endTime: endTime,
            employee: { id: createOvertimeRequestDto.employeeId },
            requestDate: requestDate,
            status: isAdmin ? StatusEnum.ACTIVE : StatusEnum.PENDING,
            reasonTemplate: {
              id: createOvertimeRequestDto.reasonTemplateId
            }
          });

          const createdOverTimeRequest: OvertimeRequest =
            await queryRunner.manager.save(overTimeRequest);

          if (
            createdOverTimeRequest &&
            createOvertimeRequestDto?.documentIds?.length
          ) {
            const documentIds = createOvertimeRequestDto.documentIds;
            await this.utilityService.updateMediaEntityIdAndType(
              documentIds,
              createdOverTimeRequest.id,
              MediaEntityTypeEnum.OVERTIME_REQUEST,
              queryRunner
            );
          }

          if (!isAdmin) {
            createApprovalStatusTrackingDto.entityId =
              createdOverTimeRequest.id;

            this.utilityService.createApprovalStatus(
              createApprovalStatusTrackingDto,
              requesterPosition,
              employee.id
            );
          }

          return { createdOverTimeRequest, isAdmin };
        },
        () => {
          const documentIds: number[] = createOvertimeRequestDto?.documentIds;
          if (documentIds?.length) {
            this.mediaService.deleteMultipleFiles(documentIds);
          }
        }
      );

    if (isAdmin) {
      await this.attendanceReportService.recalculateAttendanceReportForBackDateRequest(
        createdOverTimeRequest.employee.id,
        createdOverTimeRequest.requestDate
      );
    }

    return createdOverTimeRequest;
  }

  async exportFile(
    pagination: PaginationQueryOvertimeRequestDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.OVERTIME_REQUEST,
      exportFileDto,
      data
    );
  }

  async findAll(
    pagination: PaginationQueryOvertimeRequestDto
  ): Promise<PaginationResponse<OvertimeRequest>> {
    if (pagination.fromDate && !pagination.toDate) {
      throw new ResourceNotFoundException(
        `You need to add query fromDate and toDate format(YYYY-MM-DD)`
      );
    }

    if (pagination.toDate && !pagination.fromDate) {
      throw new ResourceNotFoundException(
        `You need to add query fromDate and toDate format(YYYY-MM-DD)`
      );
    }

    if (pagination.fromDate) {
      validateDateTimeFormat(pagination.fromDate, DEFAULT_DATE_FORMAT);
    }

    if (pagination.toDate) {
      validateDateTimeFormat(pagination.toDate, DEFAULT_DATE_FORMAT);
    }

    let createdAtCondition: FindOperator<undefined | Date>;
    if (pagination.createdFromDate && pagination.createdToDate) {
      createdAtCondition = Raw(
        (createdAt) =>
          `(TO_CHAR(${createdAt}, '${DEFAULT_DATE_FORMAT}') BETWEEN '${pagination.createdFromDate}' AND '${pagination.createdToDate}')`
      );
    }

    const createdByCondition =
      await this.utilityService.handleSearchByEmployeeCreatedBy(
        pagination.createdByUserId,
        pagination.createdByEmployeeId
      );

    const employeeIds: number[] = await this.utilityService.getCurrentUserMpath(
      pagination.employeeId
    );

    return await this.overtimeRequestRepo.findAllWithPagination(
      pagination,
      overTimeRequestSearchableColumns,
      {
        where: {
          createdAt: createdAtCondition,
          createdBy: createdByCondition,
          requestDate:
            pagination.fromDate && pagination.toDate
              ? Between(
                  dayJs(pagination.fromDate).toDate(),
                  dayJs(pagination.toDate).toDate()
                )
              : null,
          startTime: pagination.startTime ?? null,
          endTime: pagination.endTime ?? null,
          status: pagination.status ?? StatusEnum.ACTIVE,
          reason: pagination.reason ? ILike(`%${pagination.reason}%`) : null,
          employee: {
            id: In(employeeIds),
            displayFullNameEn: pagination.keywords
              ? ILike(`%${pagination.keywords}%`)
              : null,
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
            accountNo: pagination.accountNo
              ? ILike(`%${pagination.accountNo}%`)
              : null
          },
          reasonTemplate: { id: pagination.reasonTemplateId },
          overtimeType: pagination.overtimeType
        },
        relation: {
          employee: customRelationPositionAndTeam,
          reasonTemplate: true
        },
        select: {
          employee: customSelectPositionAndTeam,
          reasonTemplate: {
            id: true,
            type: true,
            name: true
          }
        },
        mapFunction: async (overtimeRequest: OvertimeRequest) => {
          if (overtimeRequest.employee) {
            const employee = overtimeRequest.employee;
            const defaultPosition = employee.positions[0];
            return {
              ...overtimeRequest,
              createdBy:
                await this.employeeRepo.getEmployeeWithUserTemplateByUserId(
                  overtimeRequest?.createdBy
                ),
              employee: {
                id: employee.id,
                accountNo: employee.accountNo,
                displayFullNameEn: employee.displayFullNameEn,
                isDefaultPosition:
                  employee?.positions?.at(0)?.isDefaultPosition,
                location:
                  defaultPosition.companyStructureLocation
                    .companyStructureComponent.name,
                outlet:
                  defaultPosition.companyStructureOutlet
                    .companyStructureComponent.name,
                department:
                  defaultPosition.companyStructureDepartment
                    .companyStructureComponent.name,
                team: defaultPosition.companyStructureTeam
                  .companyStructureComponent.name,
                position:
                  defaultPosition.companyStructurePosition
                    .companyStructureComponent.name,
                mpath: defaultPosition.mpath
              }
            };
          }
        }
      }
    );
  }

  async findOne(id: number): Promise<OvertimeRequest> {
    const overtimeRequest = await this.overtimeRequestRepo.findOne({
      where: { id },
      relations: {
        employee: true,
        reasonTemplate: true
      },
      select: {
        employee: { id: true, displayFullNameEn: true },
        reasonTemplate: {
          id: true,
          type: true,
          name: true
        }
      }
    });
    if (!overtimeRequest) {
      throw new ResourceNotFoundException(this.OVERTIME_REQUEST, id);
    }
    return overtimeRequest;
  }

  async delete(id: number) {
    await this.approvalStatusValidationService.deleteEntityById(
      id,
      MediaEntityTypeEnum.OVERTIME_REQUEST
    );
  }

  async grpcUpdateStatus(request: EmployeeProto.EmployeeStatusParams) {
    const overTimeRequest = await this.overtimeRequestRepo.findOne({
      where: {
        id: request.id
      },
      relations: { employee: true }
    });
    if (!overTimeRequest) {
      throw new RpcException({
        message: `Resource overtime request of ${request.id} not found`,
        code: 5
      });
    }
    const result = await this.overtimeRequestRepo.save(
      Object.assign(overTimeRequest, { status: request.status })
    );
    return { employeeId: result.employee.id };
  }

  // ==========================================[ Private Methods ]==========================================
  private async validateCreateOvertimeRequestDto(
    createOvertimeRequestDto: CreateOvertimeRequestDto
  ): Promise<{
    employee: Employee;
    requestDate: Date;
    isAdmin: boolean;
    requesterPosition: EmployeePosition | undefined;
    createApprovalStatusTrackingDto:
      | CreateApprovalStatusTrackingDto
      | undefined;
  }> {
    //! Find employee by id
    const employee = await this.employeeRepo.getEmployeeById(
      createOvertimeRequestDto.employeeId
    );

    //! Validate request date
    const requestDate = validateDateTime(createOvertimeRequestDto.requestDate);

    const attendanceReport = await this.findAttendanceReport(
      requestDate,
      employee.id
    );

    //! Validate request on absent time
    if (
      !attendanceReport ||
      attendanceReport.status === AttendanceReportStatusEnum.ABSENT
    ) {
      this.throwErrorOvertimeRequestOnAbsent();
    }

    //! Validate by overtime type
    if (
      createOvertimeRequestDto.overtimeType === OvertimeTypeEnum.WORKING_SHIFT
    ) {
      if (attendanceReport.status === AttendanceReportStatusEnum.DAY_OFF) {
        await this.validateWorkingShiftOvertimeRequest(
          createOvertimeRequestDto,
          attendanceReport
        );
      } else {
        this.throwErrorOvertimeRequestOnWorkingTime();
      }
    } else {
      await this.validateHourOvertimeRequest(
        createOvertimeRequestDto,
        attendanceReport
      );
    }

    //! Validate reason with reason template type
    await this.utilityService.validateTypeOtherInReasonTemplate(
      createOvertimeRequestDto.reasonTemplateId,
      createOvertimeRequestDto.reason
    );

    //! Check user type isAdmin
    const isAdmin = await this.utilityService.checkIsAdmin();

    //! Validate work flow if not isAdmin
    let workFlowValidationResult:
      | {
          workflowTypeId: number;
          requestApprovalWorkflowId: number;
          requesterPosition: any;
        }
      | undefined;

    let createApprovalStatusTrackingDto:
      | CreateApprovalStatusTrackingDto
      | undefined;

    if (!isAdmin) {
      workFlowValidationResult = await this.utilityService.validateWithWorkflow(
        employee,
        RequestWorkFlowTypeEnum.OVERTIME_REQUEST
      );

      createApprovalStatusTrackingDto = {
        approvalWorkflowId: workFlowValidationResult.requestApprovalWorkflowId,
        requestWorkflowTypeId: workFlowValidationResult.workflowTypeId,
        entityId: null,
        requestToUpdateBy: null,
        requestToUpdateChange: null,
        requestToUpdateJson: null,
        firstApprovalUserId: null,
        secondApprovalUserId: null,
        status: ApprovalStatusEnum.PENDING
      };
    }

    //! Validate request on existing request duration
    await this.validateRequestOnExisting(createOvertimeRequestDto, employee);

    return {
      employee,
      requestDate,
      isAdmin,
      createApprovalStatusTrackingDto,
      requesterPosition: workFlowValidationResult?.requesterPosition
    };
  }

  private async validateWorkingShiftOvertimeRequest(
    createOvertimeRequestDto: CreateOvertimeRequestDto,
    attendanceReport: AttendanceReport
  ): Promise<void> {
    const employee = attendanceReport.employee;

    const employeeWorkingType = employee.workingShiftId.workshiftType.name;

    //! Ignore public holiday leave
    const leaveRequests = attendanceReport.leaveRequests.filter(
      (leaveRequest) => {
        return !leaveRequest.leaveTypeVariation.leaveType.isPublicHoliday;
      }
    );

    //! If request is on leave day
    if (leaveRequests.length) {
      this.throwErrorOvertimeRequestOnLeaveTime();
    }

    //! Validate normal employee
    if (employeeWorkingType === WorkShiftTypeEnum.NORMAL) {
      const isRequestOnSunday: boolean = isSunday(
        createOvertimeRequestDto.requestDate
      );

      const publicHoliday: PublicHoliday | null =
        await this.findPublicHolidayByDate(
          createOvertimeRequestDto.requestDate
        );

      //! If request not on Sunday and not on holiday
      if (!isRequestOnSunday && !publicHoliday) {
        this.throwErrorOvertimeRequestOnWorkingTime();
      }
    } else {
      //! Validate roster employee
      const dayOffRequest: DayOffRequest | null =
        await this.findActiveDayOffRequest(createOvertimeRequestDto);

      //! Validate public holiday leave
      const publicHolidayLeave = attendanceReport.leaveRequests.filter(
        (leaveRequest) => {
          return leaveRequest.leaveTypeVariation.leaveType.isPublicHoliday;
        }
      );

      //! If request not on day off
      if (!dayOffRequest && !publicHolidayLeave) {
        this.throwErrorOvertimeRequestOnWorkingTime();
      }
    }
  }

  private throwInvalidAttendanceRecord() {
    throw new ResourceBadRequestException(
      'Request time',
      'Not found finger print record for your overtime request.'
    );
  }

  private throwErrorOvertimeRequestOnWorkingTime() {
    throw new ResourceBadRequestException(
      'Request date',
      'You can not create overtime request on your working time.'
    );
  }

  private throwErrorOvertimeRequestOnLeaveTime() {
    throw new ResourceBadRequestException(
      'Request date',
      'You can not create overtime request on your leave time.'
    );
  }

  private throwErrorOvertimeRequestOnAbsent() {
    throw new ResourceBadRequestException(
      'Request date',
      'You can not create overtime request on your absent time.'
    );
  }

  private async validateHourOvertimeRequest(
    createOvertimeRequestDto: CreateOvertimeRequestDto,
    attendanceReport: AttendanceReport
  ): Promise<void> {
    const employee = attendanceReport.employee;

    //! Validate overtime request time
    validateTimeWithFormat(
      createOvertimeRequestDto.startTime,
      DEFAULT_HOUR_MINUTE_FORMAT
    );

    validateTimeWithFormat(
      createOvertimeRequestDto.endTime,
      DEFAULT_HOUR_MINUTE_FORMAT
    );

    //! Validate overtime request duration
    await this.validateOvertimeDuration(createOvertimeRequestDto);

    //! Validate overtime request on working schedule
    await this.validateOvertimeRequestWihDayOff(
      createOvertimeRequestDto,
      attendanceReport
    );

    //! Ignore public holiday leave
    const leaveRequests = attendanceReport.leaveRequests.filter(
      (leaveRequest) => {
        return !leaveRequest.leaveTypeVariation.leaveType.isPublicHoliday;
      }
    );

    //! Validate overtime request on leave time
    for (const leaveRequest of leaveRequests) {
      await this.validateOvertimeRequestOnLeave(
        employee,
        leaveRequest,
        createOvertimeRequestDto
      );
    }
  }

  private async validateRequestOnExisting(
    overtimeRequestDto: CreateOvertimeRequestDto | UpdateOvertimeRequestDto,
    employee: Employee,
    id?: number
  ) {
    const workingShift = employee.workingShiftId;

    const overtimeRequestStart = dayJs(
      `${overtimeRequestDto.requestDate} ${overtimeRequestDto.startTime}`
    );

    const overtimeRequestEnd = dayJs(
      `${overtimeRequestDto.requestDate} ${overtimeRequestDto.endTime}`
    );

    const existingOverTimeRequests = await this.overtimeRequestRepo.find({
      relations: {
        employee: true
      },
      where: {
        id,
        employee: {
          id: overtimeRequestDto.employeeId
        },
        requestDate: dayJs(overtimeRequestDto.requestDate).toDate()
      }
    });

    if (existingOverTimeRequests.length) {
      for (const existingRequest of existingOverTimeRequests) {
        if (existingRequest.overtimeType === OvertimeTypeEnum.WORKING_SHIFT) {
          //! Validate conflict employee overtime request work shift
          if (
            overtimeRequestDto.overtimeType === OvertimeTypeEnum.WORKING_SHIFT
          ) {
            throw new ResourceConflictException(
              `Request type`,
              `Overtime request with working schedule is already exist.`
            );
          }

          if (
            employee.workingShiftId.workshiftType.name ===
            WorkShiftTypeEnum.NORMAL
          ) {
            //! Validate conflict normal employee overtime request hour
            const existingStart = dayJs(
              `${existingRequest.requestDate} ${workingShift.startWorkingTime}`
            ).add(1, 'minute');

            const existingEnd = dayJs(
              `${existingRequest.requestDate} ${workingShift.endWorkingTime}`
            ).add(-1, 'minute');
            if (
              existingStart.isBetween(
                overtimeRequestStart,
                overtimeRequestEnd
              ) ||
              existingEnd.isBetween(overtimeRequestStart, overtimeRequestEnd)
            ) {
              throw new ResourceConflictException(
                `Request duration`,
                `The overtime duration is already exist in other request.`
              );
            }
          } else {
            //! Validate conflict roster employee overtime request hour
            const workingSchedule = await this.findWorkingSchedule(
              employee.id,
              overtimeRequestDto.requestDate
            );
            const existingStart = dayJs(
              `${existingRequest.requestDate} ${workingSchedule.startWorkingTime}`
            ).add(1, 'minute');

            const existingEnd = dayJs(
              `${existingRequest.requestDate} ${workingSchedule.endWorkingTime}`
            ).add(-1, 'minute');
            if (
              existingStart.isBetween(
                overtimeRequestStart,
                overtimeRequestEnd
              ) ||
              existingEnd.isBetween(overtimeRequestStart, overtimeRequestEnd)
            ) {
              throw new ResourceConflictException(
                `Request duration`,
                `The overtime duration is already exist in other request.`
              );
            }
          }
        } else {
          //! Validate conflict employee overtime request hour
          const existingStart = dayJs(
            `${existingRequest.requestDate} ${existingRequest.startTime}`
          ).add(1, 'minute');

          const existingEnd = dayJs(
            `${existingRequest.requestDate} ${existingRequest.endTime}`
          ).add(-1, 'minute');
          if (
            existingStart.isBetween(overtimeRequestStart, overtimeRequestEnd) ||
            existingEnd.isBetween(overtimeRequestStart, overtimeRequestEnd)
          ) {
            throw new ResourceConflictException(
              `Request duration`,
              `The overtime duration is already exist in other request.`
            );
          }
        }
      }
    }
  }

  private async validateOvertimeRequestWihDayOff(
    createOvertimeRequestDto: CreateOvertimeRequestDto,
    attendanceReport: AttendanceReport
  ): Promise<void> {
    const employee = attendanceReport.employee;

    let workingShift: WorkingShift | EmployeeWorkingSchedule =
      employee.workingShiftId;

    const workingShiftType = workingShift.workshiftType.name;

    if (workingShiftType === WorkShiftTypeEnum.ROSTER) {
      workingShift = await this.findWorkingSchedule(
        employee.id,
        attendanceReport.date
      );
    }

    const shiftStart = dayJs(
      `${createOvertimeRequestDto.requestDate} ${workingShift.startWorkingTime}`
    );
    const shiftEnd = dayJs(
      `${createOvertimeRequestDto.requestDate} ${workingShift.endWorkingTime}`
    );

    let overTimeStart = dayJs(
      `${createOvertimeRequestDto.requestDate} ${createOvertimeRequestDto.startTime}`
    ).add(1, 'minute');

    let overTimeEnd = dayJs(
      `${createOvertimeRequestDto.requestDate} ${createOvertimeRequestDto.endTime}`
    ).add(-1, 'minute');

    const isOvertimeStartBetweenWorkingSchedule = overTimeStart.isBetween(
      shiftStart,
      shiftEnd
    );

    const isOvertimeEndBetweenWorkingSchedule = overTimeEnd.isBetween(
      shiftStart,
      shiftEnd
    );

    if (
      isOvertimeStartBetweenWorkingSchedule ||
      isOvertimeEndBetweenWorkingSchedule
    ) {
      //! Validate overtime request on working schedule
      if (attendanceReport.status === AttendanceReportStatusEnum.DAY_OFF) {
        const dayOffRequest: DayOffRequest | null =
          await this.findActiveDayOffRequest(createOvertimeRequestDto);
        if (!dayOffRequest) {
          this.throwErrorOvertimeRequestOnWorkingTime();
        }
      } else {
        this.throwErrorOvertimeRequestOnWorkingTime();
      }
    } else {
      //! Validate overtime request before and after working schedule
      const attendanceRecords = await this.findAttendanceRecord(
        attendanceReport.date,
        employee.fingerPrintId
      );

      overTimeStart = dayJs(
        `${createOvertimeRequestDto.requestDate} ${createOvertimeRequestDto.startTime}`
      );

      overTimeEnd = dayJs(
        `${createOvertimeRequestDto.requestDate} ${createOvertimeRequestDto.endTime}`
      );
      const overTimeDuration = dayJs(overTimeEnd).diff(overTimeStart, 'minute');

      //! Validate continue overtime
      if (shiftStart.isSame(overTimeEnd)) {
        const durationFromFirstScanToShiftStart = dayJs(shiftStart).diff(
          attendanceRecords.at(0).scanTime,
          'minute'
        );

        if (durationFromFirstScanToShiftStart < overTimeDuration) {
          this.throwInvalidAttendanceRecord();
        }
      } else if (shiftEnd.isSame(overTimeStart)) {
        const durationFromEndShiftScanToLastScan = dayJs(
          attendanceRecords.at(-1).scanTime
        ).diff(shiftEnd, 'minute');

        if (durationFromEndShiftScanToLastScan < overTimeDuration) {
          this.throwInvalidAttendanceRecord();
        }
      }

      //! Validate separated overtime before working schedule
      if (overTimeEnd.isBefore(shiftStart)) {
        const overtimeConfig =
          await this.grpcService.getGlobalConfigurationByName({
            name: GlobalConfigurationNameEnum.ALLOW_BEFORE_AND_AFTER_START_SCAN_DURATION
          });

        const overtimeScans = [...attendanceRecords].filter(
          (attendanceRecord) => {
            return dayJs(attendanceRecord.scanTime).isBefore(
              shiftStart.add(-Number(overtimeConfig.value), 'minute')
            );
          }
        );

        if (overtimeScans.length === 0) {
          this.throwInvalidAttendanceRecord();
        }

        const overtimeScanDuration = dayJs(overtimeScans.at(-1).scanTime).diff(
          overtimeScans.at(0).scanTime,
          'minute'
        );

        if (overtimeScanDuration < overTimeDuration) {
          this.throwInvalidAttendanceRecord();
        }
      }

      //! Validate separated overtime after working schedule
      if (overTimeStart.isAfter(shiftEnd)) {
        const overtimeConfig =
          await this.grpcService.getGlobalConfigurationByName({
            name: GlobalConfigurationNameEnum.ALLOW_BEFORE_AND_AFTER_END_SCAN_DURATION
          });

        const overtimeScans = [...attendanceRecords].filter(
          (attendanceRecord) => {
            return dayJs(attendanceRecord.scanTime).isAfter(
              shiftEnd.add(Number(overtimeConfig.value), 'minute')
            );
          }
        );

        const overtimeScanDuration = dayJs(overtimeScans.at(-1).scanTime).diff(
          overtimeScans.at(0).scanTime,
          'minute'
        );

        if (overtimeScanDuration < overTimeDuration) {
          this.throwInvalidAttendanceRecord();
        }
      }
    }
  }

  private async validateOvertimeRequestOnLeave(
    employee: Employee,
    leaveRequest: LeaveRequest,
    createOvertimeRequestDto: CreateOvertimeRequestDto
  ): Promise<void> {
    let leaveStart: Dayjs;
    let leaveEnd: Dayjs;

    let workingShift: WorkingShift | EmployeeWorkingSchedule =
      employee.workingShiftId;

    const workingShiftType = workingShift.workshiftType.name;
    if (workingShiftType === WorkShiftTypeEnum.ROSTER) {
      workingShift = await this.findWorkingSchedule(
        employee.id,
        createOvertimeRequestDto.requestDate
      );
    }

    const shiftStart = dayJs(
      `${createOvertimeRequestDto.requestDate} ${workingShift.startWorkingTime}`
    );
    const shiftEnd = dayJs(
      `${createOvertimeRequestDto.requestDate} ${workingShift.endWorkingTime}`
    );

    const workingShiftDuration = shiftStart.diff(shiftEnd, 'minute');
    const haftWorkShiftDuration =
      (workingShiftDuration - employee.workingShiftId.breakTime) / 2;

    if (
      leaveRequest.durationType === LeaveRequestDurationTypeEnEnum.DATE_RANGE
    ) {
      leaveStart = shiftStart;
      leaveEnd = shiftEnd;
    } else if (
      leaveRequest.durationType ===
      LeaveRequestDurationTypeEnEnum.FIRST_HALF_DAY
    ) {
      leaveStart = shiftEnd.add(-haftWorkShiftDuration, 'hour');
      leaveEnd = shiftEnd;
    } else if (
      leaveRequest.durationType ===
      LeaveRequestDurationTypeEnEnum.SECOND_HALF_DAY
    ) {
      leaveStart = shiftStart;
      leaveEnd = shiftStart.add(haftWorkShiftDuration, 'minute');
    }

    const overTimeStart = dayJs(
      `${createOvertimeRequestDto.requestDate} ${createOvertimeRequestDto.startTime}`
    ).add(1, 'minute');

    const overTimeEnd = dayJs(
      `${createOvertimeRequestDto.requestDate} ${createOvertimeRequestDto.endTime}`
    ).add(-1, 'minute');

    const isOvertimeStartBetweenLeaveDuration = overTimeStart.isBetween(
      leaveStart,
      leaveEnd
    );

    const isOvertimeEndBetweenLeaveDuration = overTimeEnd.isBetween(
      leaveStart,
      leaveEnd
    );

    if (
      isOvertimeStartBetweenLeaveDuration ||
      isOvertimeEndBetweenLeaveDuration
    ) {
      this.throwErrorOvertimeRequestOnLeaveTime();
    }
  }

  private async validateUpdateOnActiveRequest(param: {
    id?: number;
    employeeId?: number;
  }): Promise<OvertimeRequest | Employee> {
    let overtimeRequest: OvertimeRequest;
    if (param.id) {
      overtimeRequest = await this.findOne(param.id);
      validateByStatusActive(overtimeRequest.status);
    }

    let employee: Employee;

    if (param.employeeId) {
      employee = await this.employeeRepo.getEmployeeByUserId(param.employeeId);
    }

    return overtimeRequest ?? employee;
  }

  private async validateOvertimeDuration(
    createOvertimeRequestDto: CreateOvertimeRequestDto
  ) {
    const otDurationConfig =
      await this.grpcService.getGlobalConfigurationByName({
        name: GlobalConfigurationNameEnum.OVERTIME_REQUEST_DURATION
      });

    const overTimeStart = dayJs(
      `${createOvertimeRequestDto.requestDate} ${createOvertimeRequestDto.startTime}`
    );

    const overTimeEnd = dayJs(
      `${createOvertimeRequestDto.requestDate} ${createOvertimeRequestDto.endTime}`
    );

    const overTimeDuration = overTimeEnd.diff(overTimeStart, 'minute');

    const remaining = overTimeDuration % Number(otDurationConfig.value);
    if (remaining > 0 || overTimeDuration <= 0) {
      throw new ResourceConflictException(
        'Request time',
        `Invalid overtime duration, You can request ${
          otDurationConfig.value
        }, ${Number(otDurationConfig.value) * 2}, , ${
          Number(otDurationConfig.value) * 3
        }, ... Minutes`
      );
    }
  }

  private async findWorkingSchedule(
    employeeId: number,
    scheduleDate: Date | string
  ): Promise<EmployeeWorkingSchedule> {
    const workingSchedule: EmployeeWorkingSchedule =
      await this.employeeWorkingScheduleRepo.findOne({
        where: {
          employeeId: { id: employeeId },
          scheduleDate: dayJs(scheduleDate).startOf('day').toDate()
        }
      });
    return workingSchedule;
  }

  private async findActiveDayOffRequest(
    createOvertimeRequestDto: CreateOvertimeRequestDto
  ): Promise<DayOffRequest | null> {
    return await this.dayOffRequestRepo.findOne({
      where: {
        status: StatusEnum.ACTIVE,
        dayOffDate: dayJs(createOvertimeRequestDto.requestDate).toDate(),
        employee: { id: createOvertimeRequestDto.employeeId }
      }
    });
  }

  private async findAttendanceRecord(
    date: Date | string,
    fingerPrintId: string
  ): Promise<AttendanceRecord[]> {
    return await this.attendanceRecordRepo.find({
      where: {
        fingerPrintId,
        scanTime: Between(
          dayJs(date).startOf('day').toDate(),
          dayJs(date).endOf('day').toDate()
        )
      },
      order: { scanTime: 'ASC' }
    });
  }

  private async findAttendanceReport(
    date: Date | string,
    employeeId: number
  ): Promise<AttendanceReport | null> {
    return this.attendanceReportRepo.findOne({
      relations: {
        employee: { workingShiftId: { workshiftType: true } },
        leaveRequests: { leaveTypeVariation: { leaveType: true } },
        missionRequests: true,
        dayOffRequest: true,
        overtimeRequests: true
      },
      where: {
        date: dayJs(date).startOf('day').toDate(),
        employee: {
          id: employeeId
        }
      }
    });
  }

  private async findPublicHolidayByDate(
    date: Date | string
  ): Promise<PublicHoliday | null> {
    return await this.publicHolidayRepo.findOne({
      where: {
        date: dayJs(date).startOf('day').toDate()
      }
    });
  }
}
