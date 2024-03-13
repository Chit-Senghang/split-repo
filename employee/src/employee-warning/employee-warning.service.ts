import { Inject, Injectable } from '@nestjs/common';
import {
  Between,
  DataSource,
  FindOperator,
  FindOptionsRelations,
  In,
  Raw
} from 'typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import {
  dayJs,
  getCurrentDateWithFormat
} from '../shared-resources/common/utils/date-utils';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { EmployeeProto } from '../shared-resources/proto';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import {
  checkIsValidYearFormat,
  convertDateRangeToFromDateToDate,
  customValidateDate,
  validateDateTime
} from '../shared-resources/utils/validate-date-format';
import { getCurrentUserFromContext } from '../shared-resources/utils/get-user-from-current-context.common';
import { RequestWorkFlowTypeEnum } from '../request-workflow-type/common/ts/enum/request-workflow-type.enum';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { UtilityService } from '../utility/utility.service';
import { MediaService } from '../media/media.service';
import { CreateApprovalStatusTrackingDto } from '../approval-status-tracking/dto/create-approval-status-tracking.dto';
import { DEFAULT_DATE_FORMAT } from '../shared-resources/common/dto/default-date-format';
import { ApprovalStatusTrackingValidationService } from '../approval-status-tracking/approval-status-tracking-validation.service';
import { EMPLOYEE_SELECTED_FIELDS } from '../employee/constant/selected-fields.constant';
import { ApprovalStatusEnum } from '../approval-status-tracking/common/ts/enum/approval-status.enum';
import { MediaEntityTypeEnum } from '../media/common/ts/enums/entity-type.enum';
import { IEmployeeRepository } from '../employee/repository/interface/employee.repository.interface';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { EmployeeActiveStatusEnum } from '../employee/enum/employee-status.enum';
import { CreateEmployeeWarningDto } from './dto/create-employee-warning.dto';
import { EmployeeWarningPaginationDto } from './dto/employee-warning-pagination.dto';
import { UpdateEmployeeWarningDto } from './dto/update-employee-warning.dto';
import { EmployeeWarning } from './entities/employee-warning.entity';
import { EmployeeWarningStatusEnum } from './common/ts/enum/status.enum';
import { IEmployeeWarning } from './repository/interface/employee-warning.repository.interface';
import { EmployeeWarningRepository } from './repository/employee-warning.repository';

@Injectable()
export class EmployeeWarningService {
  private readonly WARNING_TYPE: string = 'warning type';

  constructor(
    private readonly dataSource: DataSource,
    private readonly utilityService: UtilityService,
    private readonly mediaService: MediaService,
    private readonly approvalStatusValidationService: ApprovalStatusTrackingValidationService,
    @Inject(EmployeeWarningRepository)
    private readonly employeeWarningRepository: IEmployeeWarning,
    @Inject(EmployeeRepository)
    private readonly employeeRepository: IEmployeeRepository
  ) {}

  async createEmployeeWarning(
    createEmployeeWarningDto: CreateEmployeeWarningDto
  ): Promise<EmployeeWarning> {
    let data: EmployeeWarning;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const warningDate = customValidateDate(
        createEmployeeWarningDto.warningDate
      );

      const validCurrentDate = customValidateDate(getCurrentDateWithFormat());
      if (dayJs(warningDate).isAfter(validCurrentDate)) {
        throw new ResourceBadRequestException(
          `warningDate`,
          `The request date must be before or equal to the current date.`
        );
      }

      const employee = await this.employeeRepository.getEmployeeById(
        createEmployeeWarningDto.employeeId
      );
      // validate reason template and check type OTHER without reason throw error.
      await this.utilityService.validateTypeOtherInReasonTemplate(
        createEmployeeWarningDto.reasonTemplateId,
        createEmployeeWarningDto.reason
      );

      const isAdmin = await this.utilityService.checkIsAdmin();
      let result: any;

      if (!isAdmin) {
        result = await this.utilityService.validateWithWorkflow(
          employee,
          RequestWorkFlowTypeEnum.WARNING
        );
        if (result) {
          const userId = getCurrentUserFromContext();
          const requester =
            await this.employeeRepository.getEmployeeByUserId(userId);
          if (employee.id === requester.id) {
            throw new ResourceForbiddenException(`You can't warn yourself`);
          }
        }
      }

      const warningCount = await this.employeeWarningRepository.countWarning(
        warningDate,
        createEmployeeWarningDto.warningTypeId,
        createEmployeeWarningDto.employeeId
      );

      const employeeWarning = queryRunner.manager.create(EmployeeWarning, {
        employee: { id: createEmployeeWarningDto.employeeId },
        reasonTemplate: { id: createEmployeeWarningDto.reasonTemplateId },
        warningTypeId: { id: createEmployeeWarningDto.warningTypeId },
        reason: createEmployeeWarningDto.reason,
        warningTitle: createEmployeeWarningDto.warningTitle,
        count: isAdmin ? warningCount + 1 : warningCount,
        status: isAdmin
          ? EmployeeWarningStatusEnum.ACTIVE
          : EmployeeWarningStatusEnum.PENDING,
        warningDate: warningDate
      });

      data = await queryRunner.manager.save(employeeWarning);

      if (data && createEmployeeWarningDto?.documentIds?.length) {
        const documentIds = createEmployeeWarningDto.documentIds;
        await this.utilityService.updateMediaEntityIdAndType(
          documentIds,
          data.id,
          MediaEntityTypeEnum.WARNING,
          queryRunner
        );
      }

      if (!isAdmin) {
        const approvalStatusDto: CreateApprovalStatusTrackingDto = {
          approvalWorkflowId: result.requestApprovalWorkflowId,
          requestWorkflowTypeId: result.workflowTypeId,
          entityId: data.id,
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

      await queryRunner.commitTransaction();

      return data;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      const documentIds: number[] = createEmployeeWarningDto?.documentIds;
      if (documentIds?.length) {
        this.mediaService.deleteMultipleFiles(documentIds);
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number): Promise<EmployeeWarning> {
    const employeeWarning = await this.employeeWarningRepository.findOne({
      where: {
        id,
        employee: {
          positions: {
            isMoved: false,
            isDefaultPosition: true
          }
        }
      },
      relations: {
        warningTypeId: true,
        employee: {
          positions: {
            companyStructureCompany: { companyStructureComponent: true },
            companyStructureLocation: { companyStructureComponent: true },
            companyStructureOutlet: { companyStructureComponent: true },
            companyStructureDepartment: { companyStructureComponent: true },
            companyStructurePosition: { companyStructureComponent: true }
          },
          contacts: true
        },
        reasonTemplate: true
      } as FindOptionsRelations<EmployeeWarning>,
      select: {
        warningTypeId: { id: true, value: true },
        employee: EMPLOYEE_SELECTED_FIELDS,
        reasonTemplate: {
          id: true,
          type: true,
          name: true
        }
      }
    });
    if (!employeeWarning) {
      throw new ResourceNotFoundException(this.WARNING_TYPE, id);
    }

    return employeeWarning;
  }

  async update(id: number, updateEmployeeWarningDto: UpdateEmployeeWarningDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (updateEmployeeWarningDto.employeeId) {
        await this.employeeRepository.getEmployeeById(
          updateEmployeeWarningDto.employeeId
        );
      }

      const employeeWarning = await this.findOne(id);

      // validate reason template and check type OTHER without reason throw error.
      await this.utilityService.validateTypeOtherInReasonTemplate(
        updateEmployeeWarningDto.reasonTemplateId ??
          employeeWarning.reasonTemplate.id,
        updateEmployeeWarningDto.reason
      );

      if (employeeWarning.status !== EmployeeWarningStatusEnum.PENDING) {
        throw new ResourceForbiddenException(
          `You can't update this record because status is active`
        );
      }

      // check if current user is creator or not.
      await this.utilityService.checkCurrentUserIsCreatorOrNot(
        employeeWarning.createdBy
      );

      const employeeWarningUpdate = queryRunner.manager.create(
        EmployeeWarning,
        Object.assign(employeeWarning, {
          warningTypeId: updateEmployeeWarningDto.warningTypeId,
          reasonTemplate: { id: updateEmployeeWarningDto.reasonTemplateId },
          reason: updateEmployeeWarningDto.reason,
          warningTitle: updateEmployeeWarningDto.warningTitle,
          warningDate: validateDateTime(updateEmployeeWarningDto.warningDate)
        })
      );

      const updatedEmployeeWarning = await queryRunner.manager.save(
        employeeWarningUpdate
      );

      //Update or delete media by given documentIds
      if (updatedEmployeeWarning && updateEmployeeWarningDto?.documentIds) {
        const documentIds = updateEmployeeWarningDto.documentIds;
        await this.utilityService.updateMediaEntityIdAndType(
          documentIds,
          updatedEmployeeWarning.id,
          MediaEntityTypeEnum.WARNING,
          queryRunner
        );
      }
      //End

      await queryRunner.commitTransaction();
      return updatedEmployeeWarning;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      throw exception;
    } finally {
      await queryRunner.release();
    }
  }

  async exportFile(
    pagination: EmployeeWarningPaginationDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.EMPLOYEE_WARNING,
      exportFileDto,
      data
    );
  }

  async findAll(
    pagination: EmployeeWarningPaginationDto
  ): Promise<PaginationResponse<EmployeeWarning>> {
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
      checkIsValidYearFormat(pagination.fromDate, DEFAULT_DATE_FORMAT);
    }

    if (pagination.toDate) {
      checkIsValidYearFormat(pagination.toDate, DEFAULT_DATE_FORMAT);
    }

    const employeeIds: number[] = await this.utilityService.getCurrentUserMpath(
      pagination.employeeId
    );

    let dateRange: any;
    if (pagination.fromDate && pagination.toDate) {
      dateRange = convertDateRangeToFromDateToDate({
        dateRange: { fromDate: pagination.fromDate, toDate: pagination.toDate }
      });
    }

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

    return await this.employeeWarningRepository.findAllWithPagination(
      pagination,
      [],
      {
        where: {
          count: pagination.count,
          createdAt: createdAtCondition,
          createdBy: createdByCondition,
          status: pagination.status ?? EmployeeWarningStatusEnum.ACTIVE,
          warningTypeId: {
            id: pagination.warningTypeId
          },
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
            displayFullNameEn: pagination.displayFullNameEn,
            accountNo: pagination.accountNo
          },
          reasonTemplate: { id: pagination.reasonTemplateId },
          warningDate: dateRange
            ? Between(dateRange.fromDate, dateRange.toDate)
            : null
        },
        relation: {
          warningTypeId: true,
          employee: {
            maritalStatus: true,
            gender: true,
            positions: {
              companyStructureCompany: { companyStructureComponent: true },
              companyStructureLocation: { companyStructureComponent: true },
              companyStructureOutlet: { companyStructureComponent: true },
              companyStructureDepartment: { companyStructureComponent: true },
              companyStructureTeam: { companyStructureComponent: true },
              companyStructurePosition: { companyStructureComponent: true }
            },
            workingShiftId: true,
            contacts: true
          },
          reasonTemplate: true
        },
        select: {
          warningTypeId: { id: true, value: true },
          employee: {
            id: true,
            firstNameEn: true,
            lastNameEn: true,
            displayFullNameEn: true,
            accountNo: true,
            startDate: true,
            contacts: {
              id: true,
              contact: true
            },
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
            }
          },
          reasonTemplate: {
            id: true,
            type: true,
            name: true
          }
        },
        mapFunction: async (employeeWarning: EmployeeWarning) => {
          if (employeeWarning.employee) {
            const employee = employeeWarning.employee;
            delete employeeWarning.employee;
            return {
              ...employeeWarning,
              createdBy:
                await this.employeeRepository.getEmployeeWithUserTemplateByUserId(
                  employeeWarning.createdBy
                ),
              employee: {
                id: employee.id,
                email: employee.email,
                firstNameEn: employee.firstNameEn,
                mpath: employee.positions[0].mpath,
                dob: employee.dob,
                gender: employee.gender.value,
                accountNo: employee.accountNo,
                startDate: employee.startDate,
                maritalStatus: employee.maritalStatus.value,
                workingShift: {
                  id: employee.workingShiftId.id,
                  name: employee.workingShiftId.name
                },
                displayFullNameEn: employee.displayFullNameEn,
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
  }

  async delete(id: number): Promise<void> {
    await this.approvalStatusValidationService.deleteEntityById(
      id,
      MediaEntityTypeEnum.WARNING
    );
  }

  async grpcUpdateEmployeeWarningStatus(
    request: EmployeeProto.EmployeeStatusParams
  ): Promise<void> {
    const employeeWarning: EmployeeWarning =
      await this.employeeWarningRepository.getEmployeeWarningById(request.id);

    // previous warning count base on type and employee id
    const warningCount: number =
      await this.employeeWarningRepository.countWarning(
        dayJs(employeeWarning.warningDate).format(DEFAULT_DATE_FORMAT),
        employeeWarning.warningTypeId.id,
        employeeWarning.employee.id
      );

    await this.employeeWarningRepository.save(
      Object.assign(employeeWarning, {
        status: EmployeeWarningStatusEnum.ACTIVE,
        count: warningCount + 1
      })
    );
  }
}
