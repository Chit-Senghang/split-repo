import { Inject, Injectable } from '@nestjs/common';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  ILike,
  In,
  Repository
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { validateByStatusActive } from '../shared-resources/utils/validate-by-status.utils';
import { UtilityService } from '../utility/utility.service';
import { StatusEnum } from '../shared-resources/common/enums/status.enum';
import { RequestWorkFlowTypeEnum } from '../request-workflow-type/common/ts/enum/request-workflow-type.enum';
import { CreateApprovalStatusTrackingDto } from '../approval-status-tracking/dto/create-approval-status-tracking.dto';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { ResourceNotFoundException } from '../shared-resources/exception/resource-not-found.exception';
import { EntityParam } from '../shared-resources/ts/interface/entity-params';
import {
  fromDateToDateConverter,
  validateDateTime
} from '../shared-resources/utils/validate-date-format';
import { ApprovalStatusTrackingValidationService } from '../approval-status-tracking/approval-status-tracking-validation.service';
import { ApprovalStatusEnum } from '../approval-status-tracking/common/ts/enum/approval-status.enum';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { IEmployeeRepository } from '../employee/repository/interface/employee.repository.interface';
import { MediaEntityTypeEnum } from '../media/common/ts/enums/entity-type.enum';
import { Employee } from '../employee/entity/employee.entity';
import { EmployeeActiveStatusEnum } from '../employee/enum/employee-status.enum';
import { DataTableNameEnum } from './../shared-resources/export-file/common/enum/data-table-name.enum';
import { CreatePayrollDeductionDto } from './dto/create-payroll-deduction.dto';
import { UpdatePayrollDeductionDto } from './dto/update-payroll-deduction.dto';
import { PayrollDeduction } from './entities/payroll-deduction.entity';
import { PayrollDeductionValidationService } from './payroll-deduction.validation.service';
import { PayrollDeductionPagination } from './dto/payroll-deduction-pagination.dto';
import { PAYROLL_DEDUCTION_RELATIONSHIP } from './constant/payroll-deduction-relationship.constant';
import { PAYROLL_DEDUCTION_SELECTED_FIELDS } from './constant/payroll-deduction-selected-fields.constant';

@Injectable()
export class PayrollDeductionService {
  constructor(
    @InjectRepository(PayrollDeduction)
    private readonly payrollDeductionRepo: Repository<PayrollDeduction>,
    private readonly utilityService: UtilityService,
    private readonly dataSource: DataSource,
    private readonly payrollDeductionValidationService: PayrollDeductionValidationService,
    private readonly approvalStatusTrackingValidationService: ApprovalStatusTrackingValidationService,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository
  ) {}

  async create(
    createPayrollDeductionDto: CreatePayrollDeductionDto
  ): Promise<PayrollDeduction> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const isAdmin: boolean = await this.utilityService.checkIsAdmin();
      let result: any;
      const deductionDate =
        createPayrollDeductionDto?.deductionDate &&
        validateDateTime(createPayrollDeductionDto?.deductionDate);

      await this.payrollDeductionValidationService.checkPayrollDeductionTypeById(
        createPayrollDeductionDto.payrollDeductionTypeId
      );

      const employee: Employee = await this.employeeRepo.getEmployeeById(
        createPayrollDeductionDto.employeeId
      );
      let status = StatusEnum.ACTIVE;

      if (!isAdmin) {
        result = await this.utilityService.validateWithWorkflow(
          employee,
          RequestWorkFlowTypeEnum.PAYROLL_DEDUCTION
        );
        status = StatusEnum.PENDING;
      }
      const data: PayrollDeduction = queryRunner.manager.create(
        PayrollDeduction,
        {
          ...createPayrollDeductionDto,
          employee: { id: createPayrollDeductionDto.employeeId },
          deductionDate: deductionDate ?? null,
          payrollDeductionType: {
            id: createPayrollDeductionDto.payrollDeductionTypeId
          },
          status
        }
      );

      const payrollDeduction: PayrollDeduction =
        await queryRunner.manager.save(data);

      if (!isAdmin && payrollDeduction) {
        const approvalStatusDto: CreateApprovalStatusTrackingDto = {
          approvalWorkflowId: result.requestApprovalWorkflowId,
          requestWorkflowTypeId: result.workflowTypeId,
          entityId: payrollDeduction.id,
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
      return payrollDeduction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async exportFile(
    pagination: PayrollDeductionPagination,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.PAYROLL_DEDUCTION,
      exportFileDto,
      data
    );
  }

  async findAll(
    pagination: PayrollDeductionPagination
  ): Promise<PaginationResponse<PayrollDeduction>> {
    let fromDate: any, toDate: any;
    if (pagination.fromDate || pagination.toDate) {
      if (pagination.fromDate && !pagination.toDate) {
        throw new ResourceNotFoundException(
          `You need to add query fromDate and toDate`
        );
      }
      if (pagination.toDate && !pagination.fromDate) {
        throw new ResourceNotFoundException(
          `You need to add query fromDate and toDate`
        );
      }
      fromDate = fromDateToDateConverter(pagination.fromDate, 'fromDate');
      toDate = fromDateToDateConverter(pagination.toDate, 'toDate');
    }
    const employeeIds: number[] = await this.utilityService.getCurrentUserMpath(
      pagination.employeeId
    );

    return await GetPagination(this.payrollDeductionRepo, pagination, [], {
      where: {
        employee: {
          id: In(employeeIds),
          status: In(Object.values(EmployeeActiveStatusEnum)),
          positions: {
            isMoved: false,
            isDefaultPosition: true,
            companyStructureLocation: {
              id: pagination.locationId ? pagination.locationId : null
            },
            companyStructureOutlet: {
              id: pagination.outletId ? pagination.outletId : null
            },
            companyStructureDepartment: {
              id: pagination.departmentId ? pagination.departmentId : null
            },
            companyStructureTeam: {
              id: pagination.teamId ? pagination.teamId : null
            },
            companyStructurePosition: {
              id: pagination.positionId ? pagination.positionId : null
            }
          }
        },
        payrollDeductionType: pagination.payrollDeductionTypeId
          ? { id: pagination.payrollDeductionTypeId }
          : null,
        status: pagination.status ?? StatusEnum.ACTIVE,
        deductionDate: fromDate && toDate ? Between(fromDate, toDate) : null
      } as FindOptionsWhere<PayrollDeduction>,
      relation: PAYROLL_DEDUCTION_RELATIONSHIP,
      select: PAYROLL_DEDUCTION_SELECTED_FIELDS,
      mapFunction: (payrollDeduction: PayrollDeduction) => {
        if (payrollDeduction.employee) {
          const employee = payrollDeduction.employee;
          delete payrollDeduction.employee;
          return {
            ...payrollDeduction,
            employee: {
              id: employee.id,
              email: employee.email,
              mpath: employee.positions[0].mpath,
              accountNo: employee.accountNo,
              displayFullNameEn: employee.displayFullNameEn,
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
    });
  }

  async findOne(id: number) {
    const payrollDeduction: PayrollDeduction =
      await this.payrollDeductionValidationService.checkPayrollDeductionById(
        id
      );

    if (payrollDeduction.employee) {
      const employee = payrollDeduction.employee;
      delete payrollDeduction.employee;

      return {
        ...payrollDeduction,
        employee: {
          id: employee.id,
          email: employee.email,
          mpath: employee.positions[0].mpath,
          accountNo: employee.accountNo,
          displayFullNameEn: employee.displayFullNameEn,
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

    throw new ResourceNotFoundException('payroll deduction', id);
  }

  async update(
    id: number,
    updatePayrollDeductionDto: UpdatePayrollDeductionDto
  ): Promise<PayrollDeduction> {
    const payrollDeduction: PayrollDeduction =
      await this.payrollDeductionValidationService.checkPayrollDeductionById(
        id
      );
    validateByStatusActive(payrollDeduction.status);

    // check if current user is creator or not.
    await this.utilityService.checkCurrentUserIsCreatorOrNot(
      payrollDeduction.createdBy
    );

    const deductionDate =
      updatePayrollDeductionDto?.deductionDate &&
      validateDateTime(updatePayrollDeductionDto?.deductionDate);

    updatePayrollDeductionDto.employeeId &&
      (await this.employeeRepo.getEmployeeById(
        updatePayrollDeductionDto.employeeId
      ));

    updatePayrollDeductionDto.payrollDeductionTypeId &&
      (await this.payrollDeductionValidationService.checkPayrollDeductionTypeById(
        updatePayrollDeductionDto.payrollDeductionTypeId
      ));

    const updatePayrollBenefit: PayrollDeduction = Object.assign(
      payrollDeduction,
      {
        ...updatePayrollDeductionDto,
        deductionDate: deductionDate ?? payrollDeduction.deductionDate,
        employee: { id: updatePayrollDeductionDto.employeeId },
        payrollDeductionTypeId: {
          id: updatePayrollDeductionDto.payrollDeductionTypeId
        }
      }
    );

    return await this.payrollDeductionRepo.save(updatePayrollBenefit);
  }

  async delete(id: number): Promise<void> {
    await this.approvalStatusTrackingValidationService.deleteEntityById(
      id,
      MediaEntityTypeEnum.PAYROLL_DEDUCTION
    );
  }

  async updatePayrollDeductionStatus(
    payrollDeductionId: number,
    status: ApprovalStatusEnum
  ) {
    const payrollDeduction: PayrollDeduction =
      await this.payrollDeductionRepo.findOne({
        where: {
          id: payrollDeductionId,
          status: StatusEnum.PENDING
        }
      });

    if (!payrollDeduction) {
      throw new ResourceNotFoundException(
        'payroll deduction',
        payrollDeductionId
      );
    }

    const result = await this.payrollDeductionRepo.save(
      Object.assign(payrollDeduction, {
        status
      })
    );
    return result;
  }

  async findOneByEntityId(request: EntityParam) {
    const payrollDeduction: PayrollDeduction =
      await this.payrollDeductionRepo.findOne({
        where: {
          id: request.id,
          employee: {
            id: request.employeeId || null,
            displayFullNameEn: request.employeeName
              ? ILike(`%${request.employeeName}%`)
              : null,
            positions: {
              isMoved: false,
              isDefaultPosition: true,
              companyStructurePosition: {
                id: request.positionId ? request.positionId : null
              },
              companyStructureLocation: {
                id: request.locationId ? request.locationId : null
              },
              companyStructureOutlet: {
                id: request.outletId ? request.outletId : null
              },
              companyStructureDepartment: {
                id: request.departmentId ? request.departmentId : null
              },
              companyStructureTeam: {
                id: request.teamId ? request.teamId : null
              }
            }
          }
        } as FindOptionsWhere<PayrollDeduction>,
        relations: PAYROLL_DEDUCTION_RELATIONSHIP,
        select: PAYROLL_DEDUCTION_SELECTED_FIELDS
      });
    if (payrollDeduction) {
      return {
        id: payrollDeduction.id,
        accountNo: payrollDeduction.employee.accountNo,
        firstNameEn: payrollDeduction.employee.firstNameEn,
        lastNameEn: payrollDeduction.employee.lastNameEn,
        phone: payrollDeduction.employee.contacts[0]?.contact,
        email: payrollDeduction.employee.email,
        displayFullNameEn: payrollDeduction.employee.displayFullNameEn,
        location:
          payrollDeduction.employee.positions[0]?.companyStructureLocation
            .companyStructureComponent.name,
        outlet:
          payrollDeduction.employee.positions[0]?.companyStructureOutlet
            .companyStructureComponent.name,
        department:
          payrollDeduction.employee.positions[0]?.companyStructureDepartment
            .companyStructureComponent.name,
        team: payrollDeduction.employee.positions[0]?.companyStructureDepartment
          .companyStructureComponent.name,
        position:
          payrollDeduction.employee.positions[0]?.companyStructurePosition
            .companyStructureComponent.name,
        employeeId: payrollDeduction.employee
          ? payrollDeduction.employee.id
          : null
      };
    }
  }
}
