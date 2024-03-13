import { Inject, Injectable } from '@nestjs/common';
import {
  Between,
  DataSource,
  FindOperator,
  ILike,
  In,
  QueryRunner,
  Raw
} from 'typeorm';
import * as _ from 'lodash';
import { ResourceBadRequestException } from '../../shared-resources/exception/badRequest.exception';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_MONTH_FORMAT,
  DEFAULT_YEAR_FORMAT
} from '../../shared-resources/common/dto/default-date-format';
import {
  dayJs,
  getCurrentDateWithFormat
} from '../../shared-resources/common/utils/date-utils';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { DataTableNameEnum } from '../../shared-resources/export-file/common/enum/data-table-name.enum';
import { exportDataFiles } from '../../shared-resources/export-file/common/function/export-data-files';
import { validateByStatusActive } from '../../shared-resources/utils/validate-by-status.utils';
import { ValidationLeaveService } from '../common/validators/validation-leave.service';
import { DurationTypeEnum } from '../../shared-resources/ts/enum/leave-type.enum';
import { ResourceConflictException } from '../../shared-resources/exception/conflict-resource.exception';
import { checkOnlyMonth } from '../../shared-resources/utils/validate-date-format';
import { ResourceNotFoundException } from '../../shared-resources/exception/resource-not-found.exception';
import { ResourceForbiddenException } from '../../shared-resources/exception/forbidden.exception';
import { StatusEnum } from '../../shared-resources/common/enums/status.enum';
import { PaginationResponse } from '../../shared-resources/ts/interface/response.interface';
import { Employee } from '../../employee/entity/employee.entity';
import {
  customRelationPositionAndTeam,
  customSelectPositionAndTeam
} from '../../../../auth/src/common/select-relation/custom-section-relation';
import { RequestWorkFlowTypeEnum } from '../../request-workflow-type/common/ts/enum/request-workflow-type.enum';
import { UtilityService } from '../../utility/utility.service';
import { MediaService } from '../../media/media.service';
import { MediaEntityTypeEnum } from '../../media/common/ts/enums/entity-type.enum';
import { CreateApprovalStatusTrackingDto } from '../../approval-status-tracking/dto/create-approval-status-tracking.dto';
import { ApprovalStatusTrackingValidationService } from '../../approval-status-tracking/approval-status-tracking-validation.service';
import { LeaveTypeInterface } from '../common/interface/leave-type.interface';
import { EmployeeActiveStatusEnum } from '../../employee/enum/employee-status.enum';
import { ApprovalStatusEnum } from '../../approval-status-tracking/common/ts/enum/approval-status.enum';
import { IEmployeeRepository } from '../../employee/repository/interface/employee.repository.interface';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { EMPLOYEE_RELATIONSHIP } from '../../employee/constant/relationship.constant';
import { EMPLOYEE_SELECTED_FIELDS } from '../../employee/constant/selected-fields.constant';
import { ILeaveTypeRepository } from '../leave-request-type/repository/interface/leave-type.repository.interface';
import { LeaveTypeRepository } from '../leave-request-type/repository/leave-type.repository';
import { IMediaRepository } from '../../media/repository/interface/media.repository.interface';
import { MediaRepository } from '../../media/repository/media.repository';
import { AttendanceReportService } from '../../attendance/attendance-report/attendance-report.service';
import { PublicHolidayRepository } from '../../attendance/public-holiday/repository/public-holiday.repository';
import { IPublicHolidayRepository } from '../../attendance/public-holiday/repository/interface/public-holiday.repository.interface';
import { handleResourceConflictException } from './../../shared-resources/common/utils/handle-resource-conflict-exception';
import { leaveConstraint } from './../../shared-resources/ts/constants/resource-exception-constraints';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { LeaveRequest } from './entities/leave-request.entity';
import { PaginationLeaveRequestDto } from './dto/pagination-leave-request.dto';
import { LeaveStock } from './entities/leave-stock.entity';
import { LeaveStockPagination } from './dto/leave-stock-paginate.dto';
import {
  LeaveRequestDurationTypeEnEnum,
  LeaveRequestDurationTypeKhEnum
} from './enums/leave-request-duration-type.enum';
import { LeaveRequestValidationService } from './leave-request.validation.service';
import { LeaveStockRepository } from './repository/leave-stock.repository';
import { LeaveRequestRepository } from './repository/leave-request.repository';
import { ILeaveRequestRepository } from './repository/interface/leave-request-repository.interface';
import { ILeaveStockRepository } from './repository/interface/leave-stock-repository.interface';
import { ILeaveStockDetailRepository } from './repository/interface/leave-stock-detail.repository.interface';
import { LeaveStockDetailTypeEnum } from './enums/leave-stock-detail.enum';
import { LeaveStockDetailRepository } from './repository/leave-stock-detail.repository';
import {
  LeaveStockResponseDto,
  LeaveTypeResponseDto
} from './dto/leave-stock-response.dto';
import { LeaveStockDetailPaginationDto } from './dto/leave-stock-detail-pagination.dto';

@Injectable()
export class LeaveRequestService {
  private readonly LEAVE_REQUEST = 'leave request';

  private readonly EMPLOYEE = 'employee';

  constructor(
    @Inject(LeaveRequestRepository)
    private readonly leaveRequestRepo: ILeaveRequestRepository,
    private readonly dataSource: DataSource,
    @Inject(MediaRepository)
    private readonly mediaRepo: IMediaRepository,
    private readonly utilityService: UtilityService,
    private readonly mediaService: MediaService,
    private readonly approvalStatusTrackingValidationService: ApprovalStatusTrackingValidationService,
    private readonly validationLeaveService: ValidationLeaveService,
    private readonly leaveRequestValidationService: LeaveRequestValidationService,
    private readonly attendanceReportService: AttendanceReportService,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(LeaveTypeRepository)
    private readonly leaveTypeRepo: ILeaveTypeRepository,
    @Inject(LeaveStockRepository)
    private readonly leaveStockRepo: ILeaveStockRepository,
    @Inject(LeaveStockDetailRepository)
    private readonly leaveStockDetailRepo: ILeaveStockDetailRepository,
    @Inject(PublicHolidayRepository)
    private readonly publicHolidayRepo: IPublicHolidayRepository
  ) {}

  validateDurationType(
    durationType: LeaveRequestDurationTypeEnEnum,
    fromDate: string,
    toDate: string
  ) {
    const durationTypes = [
      LeaveRequestDurationTypeEnEnum.FIRST_HALF_DAY,
      LeaveRequestDurationTypeEnEnum.SECOND_HALF_DAY
    ];

    if (durationTypes.includes(durationType)) {
      if (dayJs(fromDate).diff(toDate, 'day')) {
        throw new ResourceConflictException(
          this.LEAVE_REQUEST,
          `You need to input duration from day to day`
        );
      }
    }
  }

  async create(
    createLeaveRequestDto: CreateLeaveRequestDto,
    isImport = false
  ): Promise<LeaveRequest> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const employee: Employee = await this.employeeRepo.getEmployeeById(
        createLeaveRequestDto.employeeId
      );

      // validate reason template and check type OTHER without reason throw error.
      await this.utilityService.validateTypeOtherInReasonTemplate(
        createLeaveRequestDto.reasonTemplateId,
        createLeaveRequestDto.reason
      );

      if (!isImport) {
        // validate leave request date back date and cross year
        this.validateLeaveRequestDate(
          createLeaveRequestDto.fromDate,
          createLeaveRequestDto.toDate
        );
      }

      const { checkDate, leaveTypeVariation } =
        await this.leaveRequestValidationService.validationLeaveRequest(
          createLeaveRequestDto,
          employee
        );

      // check employee leave stock
      const { leaveStock, leaveDay, isRequiredDoc } =
        await this.leaveRequestValidationService.validateLeaveStock(
          employee,
          leaveTypeVariation,
          createLeaveRequestDto,
          checkDate
        );

      await this.validationLeaveService.validationExistingModifyLeave(
        RequestWorkFlowTypeEnum.LEAVE_REQUEST,
        createLeaveRequestDto.employeeId,
        {
          durationType: createLeaveRequestDto.durationType,
          fromDate: createLeaveRequestDto.fromDate,
          toDate: createLeaveRequestDto.toDate
        }
      );

      const isAdmin: boolean = await this.utilityService.checkIsAdmin();
      let result: any;
      if (!isAdmin) {
        result = await this.utilityService.validateWithWorkflow(
          employee,
          RequestWorkFlowTypeEnum.LEAVE_REQUEST
        );
      }

      const leaveRequest = this.leaveRequestRepo.create({
        reasonTemplate: { id: createLeaveRequestDto.reasonTemplateId },
        employee: { id: employee.id },
        leaveTypeVariation: { id: createLeaveRequestDto.leaveRequestTypeId },
        durationType: createLeaveRequestDto.durationType,
        ...createLeaveRequestDto,
        status: isAdmin ? StatusEnum.ACTIVE : StatusEnum.PENDING,
        leaveDuration: leaveDay,
        isSpecialLeave: createLeaveRequestDto?.isSpecialLeave
      });
      const newLeaveRequest = await queryRunner.manager.save(leaveRequest);

      if (newLeaveRequest && createLeaveRequestDto?.documentIds?.length) {
        const documentIds = createLeaveRequestDto.documentIds;
        if (isRequiredDoc) {
          await this.utilityService.updateMediaEntityIdAndType(
            documentIds,
            newLeaveRequest.id,
            MediaEntityTypeEnum.LEAVE_REQUEST,
            queryRunner
          );
        }
      }

      if (!isAdmin) {
        const approvalStatusDto: CreateApprovalStatusTrackingDto = {
          approvalWorkflowId: result.requestApprovalWorkflowId,
          requestWorkflowTypeId: result.workflowTypeId,
          entityId: newLeaveRequest.id,
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

      await this.deductLeaveStock(
        leaveStock,
        leaveRequest,
        queryRunner,
        createLeaveRequestDto.isSpecialLeave
      );

      await queryRunner.commitTransaction();
      // wait until leave request commit to db first
      if (isAdmin) {
        await this.attendanceReportService.recalculateAttendanceReportForBackDateRequest(
          employee.id,
          leaveRequest.fromDate,
          leaveRequest.toDate
        );
      }
      return leaveRequest;
    } catch (exception) {
      await queryRunner.rollbackTransaction();

      const documentIds: number[] = createLeaveRequestDto.documentIds ?? [];
      if (documentIds?.length) {
        await this.mediaService.deleteMultipleFiles(documentIds);
      }

      handleResourceConflictException(
        exception,
        leaveConstraint,
        createLeaveRequestDto
      );

      throw exception;
    } finally {
      queryRunner.release();
    }
  }

  async exportLeaveRequestFile(
    pagination: PaginationLeaveRequestDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.LEAVE_REQUEST,
      exportFileDto,
      data
    );
  }

  async findAll(
    pagination: PaginationLeaveRequestDto
  ): Promise<PaginationResponse<LeaveRequest>> {
    const employeeIds: number[] = await this.utilityService.getCurrentUserMpath(
      pagination.employeeId
    );

    let createdAtCondition: FindOperator<Date> | undefined;
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

    const data = await this.leaveRequestRepo.findAllWithPagination(
      pagination,
      [],
      {
        where: {
          createdAt: createdAtCondition,
          createdBy: createdByCondition,
          fromDate:
            pagination?.fromDate &&
            Between(pagination?.fromDate, pagination?.toDate),
          durationType: pagination?.durationType,
          leaveTypeVariation: {
            leaveType: {
              id: pagination?.leaveRequestTypeId
            }
          },
          status: pagination.status ?? StatusEnum.ACTIVE,
          employee: {
            id: pagination.employeeId ?? In(employeeIds),
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
          reasonTemplate: { id: pagination.reasonTemplateId }
        },
        relation: {
          employee: customRelationPositionAndTeam,
          leaveTypeVariation: { leaveType: { coverFrom: true } },
          reasonTemplate: true
        },
        select: {
          employee: customSelectPositionAndTeam,
          leaveTypeVariation: {
            id: true,
            leaveType: {
              id: true,
              leaveTypeName: true,
              incrementRule: true,
              incrementAllowance: true,
              requiredDoc: true,
              carryForwardStatus: true,
              carryForwardAllowance: true,
              coverFrom: {
                id: true,
                leaveTypeName: true,
                incrementRule: true,
                incrementAllowance: true,
                requiredDoc: true,
                carryForwardStatus: true,
                carryForwardAllowance: true
              }
            }
          },
          reasonTemplate: {
            id: true,
            type: true,
            name: true
          }
        },
        mapFunction: async (leaveRequest: LeaveRequest) => {
          if (leaveRequest.employee) {
            const employee = leaveRequest.employee;
            return {
              ...leaveRequest,
              durationTypeKh: this.mappingDurationTypeEnEnumToKh(
                leaveRequest.durationType
              ),
              createdBy:
                await this.employeeRepo.getEmployeeWithUserTemplateByUserId(
                  leaveRequest.createdBy
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
                team: employee.positions[0].companyStructureTeam
                  .companyStructureComponent.name,
                position:
                  employee.positions[0].companyStructurePosition
                    .companyStructureComponent.name
              }
            };
          }
        }
      }
    );

    const result: any = [];
    for (const leaveRequest of data.data) {
      const medias = await this.mediaRepo.find({
        where: {
          entityId: leaveRequest.id,
          entityType: MediaEntityTypeEnum.LEAVE_REQUEST
        }
      });
      result.push({
        ...leaveRequest,
        attachmentFiles: medias
      });
    }

    return {
      data: result,
      totalCount: data.totalCount
    };
  }

  async findOne(id: number) {
    const leaveRequest = await this.leaveRequestRepo.getLeaveRequestById(id);

    const medias = await this.mediaRepo.find({
      where: {
        entityId: leaveRequest.id,
        entityType: MediaEntityTypeEnum.LEAVE_REQUEST
      }
    });

    return {
      ...leaveRequest,
      durationTypeKh: this.mappingDurationTypeEnEnumToKh(
        leaveRequest.durationType
      ),
      employee: {
        id: leaveRequest.employee.id,
        displayName: leaveRequest.employee.displayFullNameEn
      },
      attachmentFiles: medias
    };
  }

  async update(id: number, updateLeaveRequestDto: UpdateLeaveRequestDto) {
    try {
      const leaveRequest = await this.leaveRequestRepo.getLeaveRequestById(id);
      validateByStatusActive(leaveRequest.status);
      await this.leaveRequestValidationService.validationLeaveRequest(
        updateLeaveRequestDto,
        leaveRequest.employee,
        id
      );

      // validate reason template and check type OTHER without reason throw error.
      await this.utilityService.validateTypeOtherInReasonTemplate(
        updateLeaveRequestDto.reasonTemplateId ??
          leaveRequest.reasonTemplate.id,
        updateLeaveRequestDto.reason
      );

      // check if current user is creator or not.
      await this.utilityService.checkCurrentUserIsCreatorOrNot(
        leaveRequest.createdBy
      );

      const checkDate =
        await this.leaveRequestValidationService.validateLeaveRequestByDuration(
          updateLeaveRequestDto,
          leaveRequest.employee,
          id
        );

      await this.validationLeaveService.validationExistingModifyLeave(
        RequestWorkFlowTypeEnum.LEAVE_REQUEST,
        updateLeaveRequestDto.employeeId,
        {
          durationType: updateLeaveRequestDto.durationType,
          fromDate: updateLeaveRequestDto.fromDate,
          toDate: updateLeaveRequestDto.toDate
        }
      );

      const LeaveRequestUpdate = Object.assign(leaveRequest, {
        reasonTemplate: { id: updateLeaveRequestDto.reasonTemplateId },
        employee: { id: leaveRequest.employee.id },
        durationType: updateLeaveRequestDto.durationType,
        fromDate: checkDate.fromDate,
        toDate: checkDate.toDate,
        status: StatusEnum.PENDING
      });
      return await this.leaveRequestRepo.save(LeaveRequestUpdate);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        leaveConstraint,
        updateLeaveRequestDto
      );
    }
  }

  async delete(id: number) {
    await this.approvalStatusTrackingValidationService.deleteEntityById(
      id,
      MediaEntityTypeEnum.LEAVE_REQUEST
    );
  }

  async updateLeaveRequestStatus(
    leaveRequestId: number,
    status: ApprovalStatusEnum
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const leaveRequest =
        await this.leaveRequestRepo.getLeaveRequestById(leaveRequestId);
      await this.leaveRequestRepo.save(
        Object.assign(leaveRequest, { status: status })
      );

      if (status === ApprovalStatusEnum.ACTIVE) {
        const leaveStock: LeaveStock =
          await this.leaveStockRepo.getLeaveStockByLeaveRequest(leaveRequest);

        await this.deductLeaveStock(leaveStock, leaveRequest, queryRunner);

        await this.attendanceReportService.recalculateAttendanceReportForBackDateRequest(
          leaveRequest.employee.id,
          leaveRequest.fromDate,
          leaveRequest.toDate
        );
      }

      return { employeeId: leaveRequest.employee.id };
    } catch (exception) {
      await queryRunner.rollbackTransaction();
    } finally {
      queryRunner.release();
    }
  }

  async deductLeaveStock(
    leaveStock: LeaveStock,
    leaveRequest: LeaveRequest,
    queryRunner: QueryRunner,
    isSpecialLeave = false
  ) {
    const existingLeaveStock = await this.leaveStockRepo.findOne({
      where: { id: leaveStock.id },
      relations: { employee: true },
      select: { employee: { id: true } }
    });
    // calculate deduct leave day or carry forward when exist and not expired.
    const { leaveStockDay, carryForward, leaveDuration } =
      await this.calculateDeductionCarryForward(
        existingLeaveStock,
        Number(leaveRequest.leaveDuration),
        queryRunner
      );

    // calculate special leave and leave day wit top up
    leaveRequest.leaveDuration = Number(leaveDuration);
    const { specialLeaveAllowanceDay, leaveDayTopUpRemaining } =
      await this.calculateSpecialLeaveAndLeaveDayTopUp(
        leaveRequest,
        existingLeaveStock,
        isSpecialLeave,
        queryRunner
      );

    const leaveStockEntity = queryRunner.manager.create(LeaveStock, {
      ...existingLeaveStock,
      leaveDay: Number(leaveStockDay),
      carryForwardRemaining: Number(carryForward),
      specialLeaveAllowanceDay,
      leaveDayTopUpRemaining
    });

    await queryRunner.manager.save(leaveStockEntity);
  }

  async leaveStatus() {
    return Object.values(DurationTypeEnum);
  }

  async createLeaveStock(employee: Employee, currentYear = false) {
    const leaveTypes = await this.leaveTypeRepo.find({
      relations: { coverFrom: true }
    });

    for (const leaveType of leaveTypes) {
      await this.leaveRequestRepo.generateLeaveStockForSpecificType(
        leaveType,
        employee,
        currentYear
      );
    }
  }

  async getAllEmployee(): Promise<Employee[]> {
    const whereCondition = {
      status: In(Object.values(EmployeeActiveStatusEnum)),
      positions: {
        isMoved: false
      }
    };
    return await this.employeeRepo.getAllEmployeeByProvidedCondition(
      whereCondition
    );
  }

  async generateLeaveStock() {
    // query employees who meet the criteria
    const employees = await this.getAllEmployee();

    if (employees.length) {
      // loop through each employee
      for (const employee of employees) {
        // create leave stock for the employee
        await this.createLeaveStock(employee, true);
      }
    }
  }

  async exportLeaveRemainReportFile(
    pagination: LeaveStockPagination,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.getLeaveStock(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.LEAVE_REMAIN_REPORT,
      exportFileDto,
      data
    );
  }

  async getLeaveStock(pagination: LeaveStockPagination) {
    const employees: number[] = await this.utilityService.getCurrentUserMpath(
      pagination.employeeId
    );
    if (pagination.employeeId && !employees.includes(pagination.employeeId)) {
      throw new ResourceForbiddenException(
        'employee',
        'You have no permission to see leave stock this user.'
      );
    }

    if (pagination.month) {
      checkOnlyMonth(pagination.month);
    }
    let year = dayJs().year();

    if (pagination.year) {
      year = dayJs().set('year', pagination.year).year();
    }

    let fromMonth = dayJs().startOf('months').format(DEFAULT_DATE_FORMAT);
    let toMonth = dayJs().endOf('months').format(DEFAULT_DATE_FORMAT);

    if (pagination.month) {
      fromMonth = dayJs()
        .set('month', pagination.month)
        .subtract(1, 'month')
        .set('year', year)
        .startOf('month')
        .format(DEFAULT_DATE_FORMAT);
      toMonth = dayJs()
        .set('month', pagination.month)
        .subtract(1, 'month')
        .set('year', year)
        .endOf('month')
        .format(DEFAULT_DATE_FORMAT);
    }
    const whereCondition = {
      id: employees.length && In(employees),
      status: In(Object.values(EmployeeActiveStatusEnum)),
      positions: {
        isDefaultPosition: true,
        companyStructureLocation: { id: pagination.locationId },
        companyStructureOutlet: { id: pagination.outletId },
        companyStructureDepartment: { id: pagination.departmentId },
        companyStructureTeam: { id: pagination.teamId },
        companyStructurePosition: { id: pagination.positionId }
      }
    };

    const employeeData = await this.employeeRepo.findAllWithPagination(
      pagination,
      [],
      {
        where: whereCondition,
        relation: EMPLOYEE_RELATIONSHIP,
        select: EMPLOYEE_SELECTED_FIELDS
      }
    );

    if (employeeData) {
      for (const employee of employeeData.data) {
        const leaveForMonth =
          await this.getEmployeeTotalLeaveRequestBetweenDate(
            fromMonth,
            toMonth,
            employee.id
          );

        const leaveStock = await this.getEmpLeaveStockForYear(
          employee.id,
          year
        );

        employee['leaveStock'] = await Promise.all(
          _.map(leaveStock, async (stock: LeaveStock, key) => {
            const stockTemplate: LeaveStockResponseDto = {
              leaveType: {}
            };

            stockTemplate['leaveStockInfo'] = stock;
            stockTemplate.leaveType['id'] = stock.leaveType.id;
            stockTemplate.leaveType['name'] = stock.leaveType.leaveTypeName;

            // case with prorate
            if (stock?.policyProratePerMonth > 0) {
              stockTemplate.leaveType['remaining'] =
                await this.calculateProratePerMonth(
                  stock,
                  fromMonth,
                  employee.id
                );

              stockTemplate.leaveType['used'] = Number(
                await this.leaveStockDetailRepo.getTotalLeaveDayByLeaveStockAndWithDate(
                  stock.id,
                  fromMonth
                )
              );
            } else if (stock.leaveType?.isPublicHoliday) {
              // case public holiday
              const publicHoliday =
                await this.publicHolidayRepo.getPublicHolidayBetweenDates(
                  fromMonth,
                  toMonth
                );

              stockTemplate.leaveType['used'] = Number(
                this.getLeaveTypeVariationFromLeaveRequest(
                  Number(key),
                  leaveForMonth
                )
              );

              Number(publicHoliday.length);
              stockTemplate.leaveType['remaining'] =
                Number(publicHoliday.length) -
                Number(stockTemplate.leaveType['used']);
            } else {
              // case normal leave
              const leaveForYear =
                await this.getEmployeeTotalLeaveRequestBetweenDate(
                  dayJs(fromMonth)
                    .startOf('year')
                    .add(1, 'day')
                    .format(DEFAULT_DATE_FORMAT),
                  dayJs(fromMonth).endOf('year').format(DEFAULT_DATE_FORMAT),
                  employee.id
                );

              stockTemplate.leaveType['used'] = Number(
                this.getLeaveTypeVariationFromLeaveRequest(
                  Number(key),
                  leaveForYear
                )
              );

              stockTemplate.leaveType['remaining'] = Number(stock.leaveDay);
            }

            return stockTemplate as any;
          })
        );
      }
    }

    return employeeData;
  }

  async getEmpLeaveStockForYear(employeeId: number, year: number) {
    const stocks = await this.leaveStockRepo.find({
      where: { year, employee: { id: employeeId } },
      relations: { leaveType: true },
      select: {
        leaveType: {
          id: true,
          leaveTypeName: true,
          incrementRule: true,
          incrementAllowance: true,
          requiredDoc: true,
          carryForwardStatus: true,
          carryForwardAllowance: true,
          isPublicHoliday: true
        }
      }
    });
    const data = {};
    for (const stock of stocks) {
      data[stock.leaveType.id] = stock;
    }
    return data;
  }

  async getEmpLeaveByDate(
    employeeId: number,
    toMonth: string,
    fromMonth: string,
    monthly = true
  ) {
    const leaves = await this.dataSource
      .getRepository(LeaveRequest)
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.leaveTypeVariation', 'leaveType')
      .leftJoin('leave.employee', 'employee')
      .where(
        'employee.id = :employee AND (from_date between :fromMonth AND :toMonth OR to_date between :fromMonth AND :toMonth) AND leave.status = :leaveRequestStatus',
        {
          employee: employeeId,
          toMonth: toMonth,
          fromMonth: fromMonth,
          leaveRequestStatus: ApprovalStatusEnum.ACTIVE
        }
      )
      .getMany();

    const data = {};

    for (const leave of leaves) {
      let leaveDay = +leave.leaveDuration;

      if (
        dayJs(leave.fromDate).month() !== dayJs(leave.toDate).month() &&
        monthly
      ) {
        if (
          dayJs(fromMonth).format('YYYY/MM') ===
          dayJs(leave.fromDate).format('YYYY/MM')
        ) {
          leaveDay =
            +dayJs(fromMonth)
              .endOf('month')
              .diff(dayJs(leave.fromDate), 'day') + 1;
        } else {
          leaveDay =
            +dayJs(toMonth).startOf('month').diff(dayJs(leave.toDate), 'day') +
            1;
        }
      }

      if (data[leave.leaveTypeVariation.id]) {
        data[leave.leaveTypeVariation.id] += Number(leaveDay);
        leave[leave.leaveTypeVariation.id] += Number(leaveDay);
      } else {
        data[leave.leaveTypeVariation.id] = Number(leaveDay);
      }
    }

    return { data, leaves };
  }

  async getLeaveStockDetail(
    leaveTypeId: number,
    employeeId: number,
    query: LeaveStockDetailPaginationDto
  ) {
    if (!Object.keys(query).length) {
      const currentDate = getCurrentDateWithFormat();
      query.year = dayJs(currentDate).get('year');
      query.month = dayJs(currentDate).get('month') + 1;
    }
    const date = dayJs(`${query.year}-${query.month}`).format(
      DEFAULT_DATE_FORMAT
    );
    const leaveStock =
      await this.leaveStockRepo.getEmployeeLeaveStockByLeaveTypeId(
        employeeId,
        leaveTypeId,
        date
      );

    if (leaveStock) {
      const leaveStockResponse = {};
      if (Number(leaveStock.policyProratePerMonth) > 0) {
        leaveStockResponse['proratePerMonth'] = await this.calculateProrate(
          leaveStock,
          date
        );
        leaveStockResponse['specialLeave'] = await this.calculateSpecialLeave(
          leaveStock,
          query.month,
          query.year
        );
        leaveStockResponse['allowanceTopUp'] =
          this.calculateAllowanceTopUp(leaveStock);

        leaveStockResponse['carryForward'] = await this.calculateCarryForward(
          leaveStock,
          query.month,
          query.year
        );

        leaveStockResponse['total'] = {
          allowance:
            Number(leaveStockResponse['proratePerMonth'].allowance) +
            Number(leaveStockResponse['specialLeave'].allowance) +
            Number(leaveStockResponse['allowanceTopUp'].allowance) +
            Number(leaveStockResponse['carryForward'].allowance),
          used:
            Number(leaveStockResponse['proratePerMonth'].used) +
            Number(leaveStockResponse['specialLeave'].used) +
            Number(leaveStockResponse['allowanceTopUp'].used) +
            Number(leaveStockResponse['carryForward'].used),
          remaining:
            Number(leaveStockResponse['proratePerMonth'].remaining) +
            Number(leaveStockResponse['specialLeave'].remaining) +
            Number(leaveStockResponse['allowanceTopUp'].remaining) +
            Number(leaveStockResponse['carryForward'].remaining)
        };
      } else if (leaveStock.leaveType.isPublicHoliday) {
        const publicHolidays =
          await this.publicHolidayRepo.getPublicHolidayBetweenDates(
            dayJs(date).startOf('month').format(DEFAULT_DATE_FORMAT),
            dayJs(date).endOf('month').format(DEFAULT_DATE_FORMAT)
          );
        const leaveForMonth = await this.getEmployeeTotalLeaveRequestForMonth(
          dayJs(date).startOf('month').format(DEFAULT_DATE_FORMAT),
          dayJs(date).endOf('month').format(DEFAULT_DATE_FORMAT),
          employeeId
        );

        let totalLeaveUsed = 0;
        leaveForMonth.forEach(
          (leaveRequest: LeaveRequest) =>
            (totalLeaveUsed =
              Number(totalLeaveUsed) + Number(leaveRequest.leaveDuration))
        );

        leaveStockResponse['proratePerMonth'] = {
          allowance: Number(publicHolidays.length),
          used: totalLeaveUsed,
          remaining: Number(publicHolidays.length) - Number(totalLeaveUsed)
        };
        leaveStockResponse['total'] = {
          allowance: Number(publicHolidays.length),
          used: totalLeaveUsed,
          remaining: Number(publicHolidays.length) - Number(totalLeaveUsed)
        };
      } else {
        const totalLeaveUsedInMonth =
          await this.getEmployeeTotalLeaveRequestInMonthByLeaveTypeVariation(
            employeeId,
            leaveTypeId
          );
        leaveStockResponse['allowancePerYear'] = {
          allowance: Number(leaveStock?.policyAllowancePerYear),
          used: Number(totalLeaveUsedInMonth),
          remaining:
            Number(leaveStock?.policyAllowancePerYear) -
            Number(totalLeaveUsedInMonth)
        };
        leaveStockResponse['total'] = {
          allowance: Number(leaveStock.policyAllowancePerYear),
          used: Number(totalLeaveUsedInMonth),
          remaining:
            Number(leaveStock.policyAllowancePerYear) -
            Number(totalLeaveUsedInMonth)
        };
      }

      return leaveStockResponse;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async leaveReportForPayslip(employeeId: number, year: string, month: string) {
    const leaveStocks = await this.leaveStockRepo.find({
      where: {
        employee: {
          id: employeeId
        }
      },
      relations: {
        employee: true,
        leaveType: true
      },
      select: {
        employee: {
          id: true,
          displayFullNameEn: true,
          displayFullNameKh: true
        }
      }
    });
    if (!leaveStocks.length) {
      throw new ResourceNotFoundException(
        `${this.EMPLOYEE} ${employeeId} in leave stock not found`
      );
    }
    const leaves: LeaveTypeInterface[] = [];
    if (leaveStocks.length) {
      for (const leaveStock of leaveStocks) {
        leaves.push({
          name: leaveStock.leaveType.leaveTypeName,
          nameKh: leaveStock.leaveType.leaveTypeNameKh,
          used: 0,
          remain: 0
        });
      }
    }

    return { leaves, late: 0 };
  }

  getLeaveDurationTypeEnum(): {
    durationTypeEn: LeaveRequestDurationTypeEnEnum[];
    durationTypeKh: LeaveRequestDurationTypeKhEnum[];
  } {
    return {
      durationTypeEn: Object.values(LeaveRequestDurationTypeEnEnum),
      durationTypeKh: Object.values(LeaveRequestDurationTypeKhEnum)
    };
  }

  // ======================== [Private block function] ========================

  private validateLeaveRequestDate(fromDate: string, toDate: string): void {
    //validate request date cross year
    if (
      dayJs(fromDate).startOf('year').diff(dayJs(toDate).endOf('year'), 'year')
    ) {
      throw new ResourceForbiddenException(
        this.LEAVE_REQUEST,
        'You are not allowed to request leave cross year.'
      );
    }

    //validate request toDate is before fromDate
    if (dayJs(toDate).isBefore(fromDate)) {
      throw new ResourceForbiddenException(
        this.LEAVE_REQUEST,
        'toDate must be after fromDate.'
      );
    }

    this.validateRequestDate(fromDate);
    this.validateRequestDate(toDate);
  }

  private validateRequestDate(requestDate: string): void {
    const currentDate: string = getCurrentDateWithFormat();

    const formattedRequestDate: string =
      dayJs(requestDate).format(DEFAULT_DATE_FORMAT);

    const requestDateInCurrentMonthOrAfter =
      dayJs(formattedRequestDate).isSame(currentDate, 'month') ||
      dayJs(formattedRequestDate).isAfter(currentDate);

    // validation back date
    if (!requestDateInCurrentMonthOrAfter) {
      throw new ResourceBadRequestException(
        'Leave request',
        'You are not able to request leave for the past month.'
      );
    }
  }

  private mappingDurationTypeEnEnumToKh(
    durationTypeEn: LeaveRequestDurationTypeEnEnum
  ): LeaveRequestDurationTypeKhEnum {
    switch (durationTypeEn) {
      case LeaveRequestDurationTypeEnEnum.DATE_RANGE:
        return LeaveRequestDurationTypeKhEnum.DATE_RANGE;
      case LeaveRequestDurationTypeEnEnum.FIRST_HALF_DAY:
        return LeaveRequestDurationTypeKhEnum.FIRST_HALF_DAY;
      case LeaveRequestDurationTypeEnEnum.SECOND_HALF_DAY:
        return LeaveRequestDurationTypeKhEnum.SECOND_HALF_DAY;
      default:
        break;
    }
  }

  private async getEmployeeTotalLeaveRequestForMonth(
    fromMonth: string,
    toMonth: string,
    employeeId: number
  ): Promise<LeaveRequest[]> {
    const fromDateCondition = Between(fromMonth, toMonth);
    return await this.dataSource.getRepository(LeaveRequest).find({
      where: [
        {
          employee: {
            id: employeeId
          },
          fromDate: fromDateCondition,
          status: StatusEnum.ACTIVE
        },
        {
          employee: {
            id: employeeId
          },
          toDate: fromDateCondition,
          status: StatusEnum.ACTIVE
        }
      ],
      relations: {
        employee: true,
        leaveTypeVariation: { leaveType: true }
      }
    });
  }

  private async getSpecialLeaveForYear(
    fromMonth: string,
    toMonth: string,
    employeeId: number
  ): Promise<number> {
    const specialLeaves = await this.leaveRequestRepo.find({
      where: [
        {
          isSpecialLeave: true,
          employee: {
            id: employeeId
          },
          fromDate: Between(fromMonth, toMonth),
          status: StatusEnum.ACTIVE
        },
        {
          isSpecialLeave: true,
          employee: {
            id: employeeId
          },
          toDate: Between(fromMonth, toMonth),
          status: StatusEnum.ACTIVE
        }
      ],
      relations: {
        employee: true,
        leaveTypeVariation: true
      }
    });
    let specialLeaveUsed = 0;
    if (specialLeaves.length) {
      specialLeaves.forEach(
        (specialLeave: LeaveRequest) =>
          (specialLeaveUsed += Number(specialLeave.leaveDuration))
      );
    }

    return specialLeaveUsed;
  }

  private async getEmployeeTotalLeaveRequestInMonthByLeaveTypeVariation(
    employeeId: number,
    leaveTypeId: number
  ): Promise<number> {
    const leaveRequests = await this.dataSource
      .getRepository(LeaveRequest)
      .find({
        where: [
          {
            leaveTypeVariation: { leaveType: { id: leaveTypeId } },
            employee: {
              id: employeeId
            },
            status: StatusEnum.ACTIVE
          },
          {
            leaveTypeVariation: { leaveType: { id: leaveTypeId } },
            employee: {
              id: employeeId
            },
            status: StatusEnum.ACTIVE
          }
        ],
        relations: {
          employee: true,
          leaveTypeVariation: { leaveType: true }
        }
      });

    let totalLeaveRequestInMonth = 0;
    leaveRequests.forEach(
      (leaveRequest: LeaveRequest) =>
        (totalLeaveRequestInMonth =
          Number(totalLeaveRequestInMonth) + Number(leaveRequest.leaveDuration))
    );

    return totalLeaveRequestInMonth;
  }

  private async getEmployeeTotalLeaveRequestBetweenDate(
    fromMonth: string,
    toMonth: string,
    employeeId: number
  ): Promise<LeaveRequest[]> {
    const leaveRequests: LeaveRequest[] =
      await this.getEmployeeTotalLeaveRequestForMonth(
        fromMonth,
        toMonth,
        employeeId
      );

    return this.mappingUniqueLeaveRequests(leaveRequests);
  }

  private mappingUniqueLeaveRequests(
    leaveRequests: LeaveRequest[]
  ): LeaveRequest[] {
    const uniqueLeaveRequest: LeaveRequest[] = [];
    leaveRequests.forEach((leaveRequest: LeaveRequest) => {
      const duplicate: LeaveRequest = uniqueLeaveRequest.find(
        (item: LeaveRequest) => {
          if (
            item.leaveTypeVariation.leaveType.id ===
            leaveRequest.leaveTypeVariation.leaveType.id
          ) {
            item.leaveDuration =
              Number(item.leaveDuration) + Number(leaveRequest.leaveDuration);
          } else {
            return item;
          }
        }
      );

      if (!duplicate) {
        uniqueLeaveRequest.push(leaveRequest);
      }
    });

    return uniqueLeaveRequest;
  }

  private getLeaveTypeVariationFromLeaveRequest(
    id: number,
    leaveRequests: LeaveRequest[]
  ): number {
    const leaveRequest = leaveRequests.find(
      (leaveRequest: LeaveRequest) =>
        leaveRequest.leaveTypeVariation.leaveType.id === id
    );

    if (!leaveRequest) {
      return 0;
    }

    return leaveRequest.leaveDuration;
  }

  private async calculateDeductionCarryForward(
    leaveStock: LeaveStock,
    leaveDuration: number,
    queryRunner: QueryRunner
  ) {
    const expiryDate: any = dayJs(leaveStock?.carryForwardExpiryDate).format(
      DEFAULT_DATE_FORMAT
    );

    let leaveStockDay = Number(leaveStock.leaveDay);
    let carryForward = Number(leaveStock.carryForward);
    let carryForwardUsed = 0;

    const leaveStockCarryForwardNotExpired =
      dayJs().isBefore(expiryDate) || dayJs().isSame(expiryDate);

    if (leaveStockCarryForwardNotExpired) {
      // carry forward more than or equal to duration
      if (leaveStock?.carryForward >= Number(leaveDuration)) {
        carryForward = Number(carryForward) - Number(leaveDuration);
        carryForwardUsed = Number(leaveDuration);
      } else {
        // not enough carry forward, so deduct from carry forward and leave day.
        leaveDuration = Number(leaveDuration) - Number(carryForward);
        leaveStockDay = Number(leaveStockDay) - Number(leaveDuration);
        carryForwardUsed = Number(leaveStock.carryForward);
        carryForward = 0;
      }
    } else {
      // when carry forward expired, deduct from leave day
      leaveStockDay = Number(leaveStockDay) - Number(leaveDuration);

      carryForward = 0;
    }

    if (Number(carryForwardUsed) > 0) {
      const currentDate = getCurrentDateWithFormat();
      await this.createLeaveStockDetailByType(
        carryForwardUsed,
        leaveStock.id,
        currentDate,
        LeaveStockDetailTypeEnum.CARRY_FORWARD,
        queryRunner
      );
    }

    return { leaveStockDay, carryForward, leaveDuration };
  }

  private async calculateSpecialLeaveAndLeaveDayTopUp(
    leaveRequest: LeaveRequest,
    leaveStock: LeaveStock,
    isSpecialLeave: boolean,
    queryRunner: QueryRunner
  ): Promise<{
    specialLeaveAllowanceDay: number;
    leaveDayTopUpRemaining: number;
  }> {
    let specialLeaveAllowanceDay = leaveStock.specialLeaveAllowanceDay;

    let leaveDayTopUpRemaining = 0;
    if (isSpecialLeave) {
      specialLeaveAllowanceDay -= Number(leaveRequest.leaveDuration);
      await this.createLeaveStockDetailForSpecialLeave(
        leaveRequest,
        leaveStock,
        queryRunner
      );
    } else if (leaveStock?.policySpecialLeaveAllowanceDay > 0) {
      leaveDayTopUpRemaining = await this.calculateLeaveWithTopUp(
        leaveRequest,
        leaveStock,
        queryRunner
      );
    }

    return { specialLeaveAllowanceDay, leaveDayTopUpRemaining };
  }

  private async calculateLeaveWithTopUp(
    leaveRequest: LeaveRequest,
    leaveStock: LeaveStock,
    queryRunner: QueryRunner
  ): Promise<number> {
    // calculate prorate
    return await this.createLeaveStockDetailInDifferentMonth(
      leaveRequest.fromDate,
      leaveRequest.toDate,
      leaveStock,
      leaveRequest.leaveDuration,
      queryRunner
    );
  }

  private async createLeaveStockDetailInDifferentMonth(
    fromDate: string | Date,
    toDate: string | Date,
    leaveStock: LeaveStock,
    leaveDuration: number,
    queryRunner: QueryRunner
  ) {
    let leaveDayTopUpRemaining = Number(leaveStock.leaveDayTopUpRemaining);

    if (!dayJs(fromDate).isSame(toDate, 'month')) {
      const firstMonth =
        dayJs(dayJs(fromDate).endOf('month').format(DEFAULT_DATE_FORMAT)).diff(
          fromDate,
          'days'
        ) + 1;

      leaveDayTopUpRemaining = await this.createLeaveStockDetail(
        firstMonth,
        leaveStock,
        fromDate,
        queryRunner
      );

      const secondMonth = Number(leaveDuration) - Number(firstMonth);
      leaveDayTopUpRemaining = Number(
        await this.createLeaveStockDetail(
          secondMonth,
          leaveStock,
          toDate,
          queryRunner,
          leaveDayTopUpRemaining
        )
      );
    } else {
      leaveDayTopUpRemaining = await this.createLeaveStockDetail(
        leaveDuration,
        leaveStock,
        fromDate,
        queryRunner
      );
    }

    if (leaveDayTopUpRemaining < 0) {
      leaveDayTopUpRemaining = 0;
    }

    return leaveDayTopUpRemaining;
  }

  private async createLeaveStockDetail(
    leaveDuration: number,
    leaveStock: LeaveStock,
    date: string | Date,
    queryRunner: QueryRunner,
    leaveDayTopUpRemainingInFirstMonth?: number
  ) {
    let leaveDayTopUpRemaining = Number(
      leaveDayTopUpRemainingInFirstMonth ?? leaveStock?.leaveDayTopUpRemaining
    );

    let leaveDay = 0;

    const { totalProrateRemaining } =
      await this.leaveStockDetailRepo.getTotalProrateAllowanceFromDateToStartOfYear(
        leaveStock,
        leaveStock.employee.id,
        date.toString()
      );

    if (Number(leaveDuration) <= Number(totalProrateRemaining)) {
      leaveDay = leaveDuration;
    } else {
      leaveDay = Number(totalProrateRemaining);

      leaveDuration = Number(leaveDuration) - Number(totalProrateRemaining);

      await this.createLeaveStockDetailByType(
        leaveDuration,
        leaveStock.id,
        date,
        LeaveStockDetailTypeEnum.LEAVE_TOP_UP,
        queryRunner
      );

      leaveDayTopUpRemaining =
        Number(leaveDayTopUpRemaining) - Number(leaveDuration);
    }

    const existingLeaveStockDetail =
      await this.leaveStockDetailRepo.getLeaveStockDetailByLeaveStockIdWithTypeAndDate(
        leaveStock.id,
        date,
        LeaveStockDetailTypeEnum.PRORATE
      );

    // if existing leave stock detail, just update leave day
    if (existingLeaveStockDetail) {
      leaveDay = Number(leaveDay) + Number(existingLeaveStockDetail.leaveDay);
    }

    if (leaveDay > leaveStock.policyAllowancePerYear) {
      leaveDay = leaveStock.policyAllowancePerYear;
    }

    const leaveStockDetail = this.leaveStockDetailRepo.create({
      id: existingLeaveStockDetail?.id ?? null,
      leaveDay,
      leaveStock: { id: leaveStock.id },
      month: dayJs(date).format(DEFAULT_MONTH_FORMAT) as any,
      year: dayJs(date).format(DEFAULT_YEAR_FORMAT) as any,
      type: LeaveStockDetailTypeEnum.PRORATE
    });

    await this.leaveStockDetailRepo.save(leaveStockDetail);

    return leaveDayTopUpRemaining;
  }

  private async createLeaveStockDetailForSpecialLeave(
    leaveRequest: LeaveRequest,
    leaveStock: LeaveStock,
    queryRunner: QueryRunner
  ) {
    if (dayJs(leaveRequest.fromDate).isSame(leaveRequest.toDate, 'month')) {
      await this.createLeaveStockDetailByType(
        leaveRequest.leaveDuration,
        leaveStock.id,
        leaveRequest.fromDate,
        LeaveStockDetailTypeEnum.SPECIAL_LEAVE,
        queryRunner
      );
    } else {
      const firstMonth =
        dayJs(
          dayJs(leaveRequest.fromDate)
            .endOf('month')
            .format(DEFAULT_DATE_FORMAT)
        ).diff(leaveRequest.fromDate, 'days') + 1;

      await this.createLeaveStockDetailByType(
        firstMonth,
        leaveStock.id,
        leaveRequest.fromDate,
        LeaveStockDetailTypeEnum.SPECIAL_LEAVE,
        queryRunner
      );

      const secondMonth =
        Number(leaveRequest.leaveDuration) - Number(firstMonth);
      await this.createLeaveStockDetailByType(
        secondMonth,
        leaveStock.id,
        leaveRequest.toDate,
        LeaveStockDetailTypeEnum.SPECIAL_LEAVE,
        queryRunner
      );
    }
  }

  private async createLeaveStockDetailByType(
    leaveDay: number,
    leaveStockId: number,
    date: string | Date,
    type: LeaveStockDetailTypeEnum,
    queryRunner: QueryRunner
  ) {
    const existingLeaveStockDetail = await this.leaveStockDetailRepo.findOne({
      where: {
        leaveStock: { id: leaveStockId },
        month: dayJs(date).format(DEFAULT_MONTH_FORMAT) as any,
        year: dayJs(date).format(DEFAULT_YEAR_FORMAT) as any,
        type
      },
      relations: { leaveStock: true }
    });

    const leaveStockDetail = this.leaveStockDetailRepo.create({
      id: existingLeaveStockDetail ? existingLeaveStockDetail.id : null,
      leaveDay: existingLeaveStockDetail
        ? Number(existingLeaveStockDetail.leaveDay) + Number(leaveDay)
        : leaveDay,
      leaveStock: { id: leaveStockId },
      month: dayJs(date).format(DEFAULT_MONTH_FORMAT) as any,
      year: dayJs(date).format(DEFAULT_YEAR_FORMAT) as any,
      type
    });

    await queryRunner.manager.save(leaveStockDetail);
  }

  private async calculateProratePerMonth(
    stock: LeaveStock,
    date: string,
    employeeId: number
  ): Promise<number> {
    const carryForwardRemaining = this.getCarryForward(stock);
    const { totalProrateRemaining } =
      await this.leaveStockDetailRepo.getTotalProrateAllowanceFromDateToStartOfYear(
        stock,
        employeeId,
        date
      );

    return (
      Number(totalProrateRemaining) +
      Number(stock.specialLeaveAllowanceDay) +
      Number(stock.leaveDayTopUpRemaining) +
      Number(carryForwardRemaining)
    );
  }

  private getCarryForward(stock: LeaveStock, month?: number): number {
    let currentDate = getCurrentDateWithFormat();
    if (month) {
      currentDate = dayJs(currentDate)
        .set('month', month)
        .subtract(1, 'month')
        .format(DEFAULT_DATE_FORMAT);
    }

    let carryForwardRemaining = 0;
    if (!dayJs(currentDate).isAfter(stock?.carryForwardExpiryDate)) {
      carryForwardRemaining = stock?.carryForward;
    }

    return Number(carryForwardRemaining);
  }

  private async calculateProrate(
    leaveStock: LeaveStock,
    date: string | Date
  ): Promise<LeaveTypeResponseDto> {
    const leaveStockDetail =
      await this.leaveStockDetailRepo.getLeaveStockDetailByLeaveStockIdWithTypeAndDate(
        leaveStock.id,
        date,
        LeaveStockDetailTypeEnum.PRORATE
      );

    const prorate =
      await this.leaveStockDetailRepo.getTotalProrateAllowanceFromDateToStartOfYear(
        leaveStock,
        leaveStock.employee.id,
        date.toString()
      );

    return {
      allowance: prorate.totalProrateAllowance,
      used: Number(leaveStockDetail?.leaveDay ?? 0),
      remaining: prorate.totalProrateRemaining
    };
  }

  private async calculateSpecialLeave(
    leaveStock: LeaveStock,
    month: number,
    year: number
  ): Promise<LeaveTypeResponseDto> {
    const totalSpecialLeaveUsedInMonth =
      await this.leaveStockDetailRepo.getTotalLeaveDayByLeaveStockIdWithType(
        leaveStock.id,
        year,
        month,
        LeaveStockDetailTypeEnum.SPECIAL_LEAVE
      );
    return {
      allowance: Number(leaveStock.policySpecialLeaveAllowanceDay),
      used: Number(totalSpecialLeaveUsedInMonth),
      remaining: Number(leaveStock.specialLeaveAllowanceDay)
    };
  }

  private calculateAllowanceTopUp(
    leaveStock: LeaveStock
  ): LeaveTypeResponseDto {
    return {
      allowance: Number(leaveStock.leaveDayTopUp),
      used:
        Number(leaveStock.leaveDayTopUp) -
        Number(leaveStock.leaveDayTopUpRemaining),
      remaining: Number(leaveStock.leaveDayTopUpRemaining)
    };
  }

  private async calculateCarryForward(
    leaveStock: LeaveStock,
    month: number,
    year: number
  ): Promise<LeaveTypeResponseDto> {
    const carryForwardRemaining = this.getCarryForward(leaveStock, month);
    const totalUsedInMonth =
      await this.leaveStockDetailRepo.getTotalLeaveDayByLeaveStockIdWithType(
        leaveStock.id,
        year,
        month,
        LeaveStockDetailTypeEnum.CARRY_FORWARD
      );
    return {
      allowance: Number(leaveStock.actualCarryForward),
      used: Number(totalUsedInMonth),
      remaining: Number(carryForwardRemaining)
    };
  }
}
