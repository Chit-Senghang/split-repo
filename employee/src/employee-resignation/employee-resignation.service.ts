import { Dayjs } from 'dayjs';
import { Inject, Injectable } from '@nestjs/common';
import {
  Between,
  DataSource,
  FindOperator,
  ILike,
  In,
  LessThanOrEqual,
  QueryRunner,
  Raw
} from 'typeorm';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { ResourceConflictException } from '../shared-resources/exception/conflict-resource.exception';
import { validateByStatusActive } from '../shared-resources/utils/validate-by-status.utils';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import {
  checkIsValidYearFormat,
  customValidateDate
} from '../shared-resources/utils/validate-date-format';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { RequestWorkFlowTypeEnum } from '../request-workflow-type/common/ts/enum/request-workflow-type.enum';
import { Employee } from '../employee/entity/employee.entity';
import { UtilityService } from '../utility/utility.service';
import { MediaService } from '../media/media.service';
import { CreateApprovalStatusTrackingDto } from '../approval-status-tracking/dto/create-approval-status-tracking.dto';
import { DEFAULT_DATE_FORMAT } from '../shared-resources/common/dto/default-date-format';
import { ApprovalStatusTrackingValidationService } from '../approval-status-tracking/approval-status-tracking-validation.service';
import { ApprovalStatusEnum } from '../approval-status-tracking/common/ts/enum/approval-status.enum';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { IEmployeeRepository } from '../employee/repository/interface/employee.repository.interface';
import {
  dayJs,
  firstDayOfCurrentMonth,
  getCurrentDateWithFormat
} from '../shared-resources/common/utils/date-utils';
import { EmployeeStatusEnum } from '../employee/enum/employee-status.enum';
import { MediaEntityTypeEnum } from '../media/common/ts/enums/entity-type.enum';
import { employeeResignationTypeConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { CreateEmployeeResignationDto } from './dto/create-employee-resignation.dto';
import { ResignationPaginationDto } from './dto/resignation-pagination.dto';
import { UpdateEmployeeResignationDto } from './dto/update-employee-resignation.dto';
import { EmployeeResignationValidationService } from './employee-resignation-validation.service';
import {
  EmployeeResignation,
  employeeResignationSearchableColumns
} from './entity/employee-resignation.entity';
import { EmployeeResignationStatusEnum } from './common/ts/enums/employee-resignation-status.enum';
import { EmployeeResignationRepository } from './repository/employee-resignation.repository';
import { IEmployeeResignationRepository } from './repository/interface/employee-resignation.repository.interface';

@Injectable()
export class EmployeeResignationService {
  constructor(
    private readonly employeeResignationValidationService: EmployeeResignationValidationService,
    private readonly dataSource: DataSource,
    @Inject(EmployeeResignationRepository)
    private readonly employeeResignationRepository: IEmployeeResignationRepository,
    private readonly utilityService: UtilityService,
    private readonly mediaService: MediaService,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    private readonly approvalStatusValidationService: ApprovalStatusTrackingValidationService
  ) {}

  async create(
    createEmployeeResignationDto: CreateEmployeeResignationDto,
    employeeId: number,
    isImport = false
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!isImport) {
        this.validateBackMonthAndDay(createEmployeeResignationDto.resignDate);
      }
      const employee: Employee =
        await this.employeeRepo.getEmployeeById(employeeId);

      const existingEmployeeResignation: EmployeeResignation =
        await this.employeeResignationRepository.getEmployeeResignationByEmployeeId(
          employee.id
        );

      if (existingEmployeeResignation) {
        throw new ResourceConflictException('employee resignation');
      }

      // validate reason template and check type OTHER without reason throw error.
      await this.utilityService.validateTypeOtherInReasonTemplate(
        createEmployeeResignationDto.reasonTemplateId,
        createEmployeeResignationDto.reason
      );

      const isAdmin = await this.utilityService.checkIsAdmin();
      let result: any;
      if (!isAdmin) {
        result = await this.utilityService.validateWithWorkflow(
          employee,
          RequestWorkFlowTypeEnum.RESIGNATION_REQUEST
        );
      }

      const employeeResignation = queryRunner.manager.create(
        EmployeeResignation,
        {
          employee: { id: employeeId },
          reasonTemplate: { id: createEmployeeResignationDto.reasonTemplateId },
          resignTypeId: { id: createEmployeeResignationDto.resignTypeId },
          resignDate: customValidateDate(
            createEmployeeResignationDto.resignDate
          ),
          reason: createEmployeeResignationDto.reason,
          status: EmployeeResignationStatusEnum.PENDING
        }
      );

      const newEmployeeResignation =
        await queryRunner.manager.save(employeeResignation);

      if (
        newEmployeeResignation &&
        createEmployeeResignationDto?.documentIds?.length
      ) {
        const documentIds = createEmployeeResignationDto.documentIds;
        if (documentIds?.length) {
          await this.utilityService.updateMediaEntityIdAndType(
            documentIds,
            newEmployeeResignation.id,
            MediaEntityTypeEnum.RESIGNATION_REQUEST,
            queryRunner
          );
        }
      }

      if (!isAdmin) {
        const approvalStatusDto: CreateApprovalStatusTrackingDto = {
          approvalWorkflowId: result.requestApprovalWorkflowId,
          requestWorkflowTypeId: result.workflowTypeId,
          entityId: newEmployeeResignation.id,
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

      //when admin updates, update employee resignation status
      if (isAdmin) {
        await this.updateEmployeeResignationStatusAndEmployeeStatus(
          newEmployeeResignation,
          queryRunner
        );
      }
      await queryRunner.commitTransaction();
      return newEmployeeResignation;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      const documentIds: number[] = createEmployeeResignationDto?.documentIds;
      if (documentIds?.length) {
        this.mediaService.deleteMultipleFiles(documentIds);
      }
      handleResourceConflictException(
        exception,
        employeeResignationTypeConstraint,
        createEmployeeResignationDto
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number) {
    return await this.employeeResignationValidationService.validateEmployeeResignation(
      id
    );
  }

  async exportFile(
    pagination: ResignationPaginationDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.EMPLOYEE_RESIGNATION,
      exportFileDto,
      data
    );
  }

  async findAll(pagination: ResignationPaginationDto) {
    if (pagination.resignFromDate) {
      checkIsValidYearFormat(pagination.resignFromDate, DEFAULT_DATE_FORMAT);
    }

    if (pagination.resignToDate) {
      checkIsValidYearFormat(pagination.resignToDate, DEFAULT_DATE_FORMAT);
    }

    if (pagination.resignEmployeeInMonth) {
      checkIsValidYearFormat(
        pagination.resignEmployeeInMonth,
        DEFAULT_DATE_FORMAT
      );
    }

    if (pagination.resignFromDate && !pagination.resignToDate) {
      throw new ResourceNotFoundException(
        `You need to add query ${pagination.resignFromDate} and ${pagination.resignToDate} format(${DEFAULT_DATE_FORMAT})`
      );
    }

    if (!pagination.resignToDate && pagination.resignFromDate) {
      throw new ResourceNotFoundException(
        `You need to add query ${pagination.resignFromDate} and ${pagination.resignToDate} format(${DEFAULT_DATE_FORMAT})`
      );
    }

    const employeeIds = await this.utilityService.getCurrentUserMpath(
      pagination.employeeId
    );
    const firstDayCurrentMonth: any = firstDayOfCurrentMonth();

    let resignDateCondition: FindOperator<undefined | Date>;
    if (pagination.resignFromDate && pagination.resignToDate) {
      resignDateCondition = Between(
        pagination.resignFromDate,
        pagination.resignToDate
      );
    } else if (pagination?.resignEmployeeInMonth) {
      resignDateCondition = Between(
        firstDayCurrentMonth,
        pagination?.resignEmployeeInMonth
      );
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

    return await this.employeeResignationRepository.findAllWithPagination(
      pagination,
      employeeResignationSearchableColumns,
      {
        where: {
          resignTypeId: { id: pagination.resignTypeId },
          createdAt: createdAtCondition,
          createdBy: createdByCondition,
          employee: {
            id: In(employeeIds),
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
          resignDate: resignDateCondition,
          status:
            pagination.status ??
            In([
              EmployeeResignationStatusEnum.ACTIVE,
              EmployeeResignationStatusEnum.IN_SCHEDULE
            ]),
          reasonTemplate: { id: pagination.reasonTemplateId }
        },
        relation: {
          employee: {
            gender: true,
            maritalStatus: true,
            positions: {
              companyStructureCompany: { companyStructureComponent: true },
              companyStructureLocation: { companyStructureComponent: true },
              companyStructureOutlet: { companyStructureComponent: true },
              companyStructureDepartment: { companyStructureComponent: true },
              companyStructureTeam: { companyStructureComponent: true },
              companyStructurePosition: { companyStructureComponent: true }
            },
            contacts: true,
            workingShiftId: { workshiftType: true }
          },
          resignTypeId: true,
          reasonTemplate: true
        },
        select: {
          employee: {
            id: true,
            firstNameEn: true,
            lastNameEn: true,
            displayFullNameEn: true,
            contractPeriodStartDate: true,
            accountNo: true,
            contractPeriodEndDate: true,
            startDate: true,
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
              },
              mpath: true
            },
            contacts: { id: true, contact: true, isDefault: true }
          },
          resignTypeId: { id: true, value: true },
          reasonTemplate: {
            id: true,
            type: true,
            name: true
          }
        },
        mapFunction: async (employeeResignation: EmployeeResignation) => {
          if (employeeResignation.employee) {
            const employee = employeeResignation.employee;
            return {
              ...employeeResignation,
              createdBy:
                await this.employeeRepo.getEmployeeWithUserTemplateByUserId(
                  employeeResignation.createdBy
                ),
              employee: {
                id: employee?.id,
                email: employee?.email,
                firstNameEn: employee?.firstNameEn,
                mpath: employee?.positions[0].mpath,
                accountNo: employee?.accountNo,
                dob: employee?.dob,
                gender: employee?.gender.value,
                startDate: employee?.startDate,
                maritalStatus: employee?.maritalStatus.value,
                contractPeriodStartDate: employee?.contractPeriodStartDate,
                contractPeriodEndDate: employee?.contractPeriodEndDate,
                workingShift: {
                  id: employee?.workingShiftId.id,
                  name: employee?.workingShiftId.name
                },
                displayFullNameEn: employee?.displayFullNameEn,
                isDefaultPosition:
                  employee?.positions?.at(0)?.isDefaultPosition,
                location:
                  employee?.positions[0].companyStructureLocation
                    .companyStructureComponent.name,
                outlet:
                  employee?.positions[0].companyStructureOutlet
                    .companyStructureComponent.name,
                department:
                  employee?.positions[0].companyStructureDepartment
                    .companyStructureComponent.name,
                team:
                  employee?.positions[0].companyStructureTeam !== null
                    ? employee?.positions[0].companyStructureTeam
                        .companyStructureComponent.name
                    : null,
                position:
                  employee?.positions[0].companyStructurePosition
                    .companyStructureComponent.name
              }
            };
          }
        }
      }
    );
  }

  async update(
    id: number,
    updateEmployeeResignationDto: UpdateEmployeeResignationDto
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (updateEmployeeResignationDto.status) {
        throw new ResourceForbiddenException(`You can't update status`);
      }
      const employeeResignation = await this.findOne(id);
      validateByStatusActive(employeeResignation.status);

      // validate reason template and check type OTHER without reason throw error.
      await this.utilityService.validateTypeOtherInReasonTemplate(
        updateEmployeeResignationDto.reasonTemplateId ??
          employeeResignation.reasonTemplate.id,
        updateEmployeeResignationDto.reason
      );
      // check if current user is creator or not.
      await this.utilityService.checkCurrentUserIsCreatorOrNot(
        employeeResignation.createdBy
      );

      let resignDate = employeeResignation.resignDate;
      if (updateEmployeeResignationDto.resignDate) {
        resignDate = customValidateDate(
          updateEmployeeResignationDto.resignDate
        ) as any;
      }

      const employeeResignationUpdate = queryRunner.manager.create(
        EmployeeResignation,
        Object.assign(employeeResignation, {
          ...updateEmployeeResignationDto,
          reasonTemplate: { id: updateEmployeeResignationDto.reasonTemplateId },
          resignDate
        })
      );
      const updatedEmployeeResignation = await queryRunner.manager.save(
        employeeResignationUpdate
      );

      //Update or delete media by given documentIds
      if (
        updatedEmployeeResignation &&
        updateEmployeeResignationDto?.documentIds
      ) {
        const documentIds = updateEmployeeResignationDto.documentIds;
        await this.utilityService.updateMediaEntityIdAndType(
          documentIds,
          updatedEmployeeResignation.id,
          MediaEntityTypeEnum.RESIGNATION_REQUEST,
          queryRunner
        );
      }
      //End

      await queryRunner.commitTransaction();

      return updatedEmployeeResignation;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      handleResourceConflictException(
        exception,
        employeeResignationTypeConstraint,
        updateEmployeeResignationDto
      );
      throw exception;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: number): Promise<void> {
    await this.approvalStatusValidationService.deleteEntityById(
      id,
      MediaEntityTypeEnum.RESIGNATION_REQUEST
    );
  }

  /**
   * Function will return employee resignation that effective date is equal to
   * current date and status is IN_SCHEDULE
   */
  async getEmployeeResignationThatEffectiveDateEqualToOrLessThanCurrentDate(): Promise<
    EmployeeResignation[]
  > {
    const currentDate: string = getCurrentDateWithFormat();
    return await this.employeeResignationRepository.find({
      where: {
        resignDate: LessThanOrEqual(dayJs(currentDate).toDate()),
        status: EmployeeResignationStatusEnum.IN_SCHEDULE
      }
    });
  }

  /**
   * Function will update employee resignation status to IN_SCHEDULE OR ACTIVE.
   * It will also update employee status to RESIGNED when record is ACTIVE.
   **  Noted: 'isScheduleBODRun = true' only 'BEGINNING_OF_THE_DAY' run because
   * @param employeeResignId
   */
  async updateEmployeeResignationStatus(
    employeeResignId: number
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const employeeResignation: EmployeeResignation =
        await this.getEmployeeResignationForUpdate(employeeResignId);

      if (employeeResignation) {
        // case record effective Date is the same as current date
        // when effected this case true
        const isEffectDate: boolean =
          this.checkEffectiveDateEqualOrLessCurrentDate(
            employeeResignation.resignDate
          );
        if (isEffectDate) {
          employeeResignation.status = EmployeeResignationStatusEnum.ACTIVE;
          await queryRunner.manager.save(
            EmployeeResignation,
            employeeResignation
          );

          // update employee status to RESIGNED and resign date
          await this.updateEmployeeStatusAfterRecordActive(
            employeeResignation.employee.id,
            employeeResignation.resignDate,
            queryRunner
          );
        } else {
          employeeResignation.status =
            EmployeeResignationStatusEnum.IN_SCHEDULE;
          await queryRunner.manager.save(
            EmployeeResignation,
            employeeResignation
          );
        }
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateEmployeeResignationStatusAndEmployeeStatus(
    employeeResignation: EmployeeResignation,
    queryRunner: QueryRunner
  ) {
    const isEffectDate: boolean = this.checkEffectiveDateEqualOrLessCurrentDate(
      employeeResignation.resignDate
    );

    // case record is the same as current date.
    if (isEffectDate) {
      await queryRunner.manager.save(
        EmployeeResignation,
        Object.assign(employeeResignation, {
          status: EmployeeResignationStatusEnum.ACTIVE
        })
      );

      const employee = await queryRunner.manager.findOne(Employee, {
        where: {
          id: employeeResignation.employee.id
        }
      });

      await queryRunner.manager.save(
        Employee,
        Object.assign(employee, {
          status: EmployeeStatusEnum.RESIGNED
        })
      );
    } else {
      await queryRunner.manager.save(
        EmployeeResignation,
        Object.assign(employeeResignation, {
          status: EmployeeResignationStatusEnum.IN_SCHEDULE
        })
      );
    }
  }

  async handleUpdateEmployeeResignationJob(): Promise<void> {
    const employeeResignations: EmployeeResignation[] = // employee resignation that effective date is equal current date
      await this.getEmployeeResignationThatEffectiveDateEqualToOrLessThanCurrentDate();
    if (employeeResignations) {
      for (const employeeResignation of employeeResignations) {
        await this.updateEmployeeResignationStatus(employeeResignation.id);
      }
    }
  }

  // ===================== [ Private functions block] =====================
  /**
   * Function will return true if currentDate and effectiveDate is the same; otherwise, return false.
   * @param resignDate
   */
  private checkEffectiveDateEqualOrLessCurrentDate(
    resignDate: Date | Dayjs
  ): boolean {
    const currentDate: string = getCurrentDateWithFormat();
    const formattedEffectiveDate: string = dayJs(resignDate)
      .utc(true)
      .format(DEFAULT_DATE_FORMAT);
    return (
      dayJs(currentDate).isSame(formattedEffectiveDate) ||
      dayJs(currentDate).isAfter(formattedEffectiveDate)
    );
  }

  /**
   * Function will return employee resignation by id OR/AND resignDate.
   * @param employeeResignId
   */
  private async getEmployeeResignationForUpdate(
    employeeResignId: number
  ): Promise<EmployeeResignation> {
    const employeeResignation =
      await this.employeeResignationRepository.findOne({
        where: {
          id: employeeResignId,
          status: EmployeeResignationStatusEnum.IN_SCHEDULE
        },
        relations: {
          employee: true
        }
      });
    return employeeResignation;
  }

  /**
   * Function will update employee status to RESIGNED.
   * @param employeeId
   * @param queryRunner
   */
  private async updateEmployeeStatusAfterRecordActive(
    employeeId: number,
    resignDate: Date,
    queryRunner: QueryRunner
  ): Promise<void> {
    const employee: Employee = await queryRunner.manager.findOne(Employee, {
      where: {
        id: employeeId
      }
    });
    employee.status = EmployeeStatusEnum.RESIGNED;
    employee.resignDate = resignDate;
    await queryRunner.manager.save(Employee, employee);
  }

  private validateBackMonthAndDay(resignDate: string) {
    if (dayJs().isAfter(resignDate, 'month')) {
      throw new ResourceConflictException(
        'month',
        `resign date can't back month`
      );
    }

    if (dayJs().isAfter(resignDate, 'day')) {
      throw new ResourceConflictException(
        'day',
        `resign date must not be before current date`
      );
    }
  }
}
