import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  QueryRunner,
  Repository
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeMovement } from '../../../employee/src/employee-movement/entities/employee-movement.entity';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { validateByStatusActive } from '../shared-resources/utils/validate-by-status.utils';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { UtilityService } from '../utility/utility.service';
import { Employee } from '../employee/entity/employee.entity';
import { CreateApprovalStatusTrackingDto } from '../approval-status-tracking/dto/create-approval-status-tracking.dto';
import { RequestWorkFlowTypeEnum } from '../request-workflow-type/common/ts/enum/request-workflow-type.enum';
import { BenefitComponent } from '../benefit-component/entities/benefit-component.entity';
import { ApprovalStatusTrackingValidationService } from '../approval-status-tracking/approval-status-tracking-validation.service';
import { StatusEnum } from '../shared-resources/common/enums/status.enum';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATE_TIME_FORMAT
} from '../shared-resources/common/dto/default-date-format';
import { dayJs } from '../shared-resources/common/utils/date-utils';
import { isValidDate } from '../shared-resources/utils/validate-date-format';
import { WorkShiftTypeEnum } from '../workshift-type/common/ts/enum/workshift-type.enum';
import { PayrollReport } from '../payroll-generation/entities/payroll-report.entity';
import { GrpcService } from '../grpc/grpc.service';
import { PayrollReportTypeEnum } from '../payroll-generation/enum/payroll-report-type.enum';
import {
  EmployeeActiveStatusEnum,
  EmployeeStatusEnum
} from '../employee/enum/employee-status.enum';
import { ApprovalStatusEnum } from '../approval-status-tracking/common/ts/enum/approval-status.enum';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { IEmployeeRepository } from '../employee/repository/interface/employee.repository.interface';
import { MediaEntityTypeEnum } from '../media/common/ts/enums/entity-type.enum';
import { BenefitAdjustmentType } from '../benefit-adjustment-type/entities/benefit-adjustment-type.entity';
import { DefaultBenefitAdjustmentTypeEnum } from '../benefit-adjustment-type/enums/benefit-adjustment-type.enum';
import { IEmployeeMovementRepository } from '../employee-movement/repository/interface/employee-movement.repository.interface';
import { EmployeeMovementRepository } from '../employee-movement/repository/employee-movement.repository';
import { payrollConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { CreatePayrollBenefitAdjustmentDto } from './dto/create-payroll-benefit-adjustment.dto';
import { UpdatePayrollBenefitAdjustmentDto } from './dto/update-payroll-benefit-adjustment.dto';
import { PayrollBenefitAdjustment } from './entities/payroll-benefit-adjustment.entity';
import { PayrollBenefitAdjustmentDetail } from './entities/payroll-benefit-adjustment-detail.entity';
import { PaginationPayrollAdjustmentDto } from './dto/paginate-payroll-adjustment.dto';
import { CreatePayrollBenefitAdjustmentDetailDto } from './dto/create-payroll-benefit-adjustment-detail.dto';
import { AdjustmentDetailStatusEnum } from './enum/status.enum';
import { PaginationPayrollBenefitDto } from './dto/payroll-benefit-pagination.dto';
import {
  PAYROLL_BENEFIT_RELATIONSHIP,
  PAYROLL_BENEFIT_SELECTED_FIELDS
} from './constant/payroll-benefit.constant';
import { ATTENDANCE_ALLOWANCE } from './constant/attendance-allow.constant';

@Injectable()
export class PayrollBenefitAdjustmentService {
  constructor(
    @InjectRepository(PayrollBenefitAdjustment)
    private readonly payrollBenefitAdjustmentRepo: Repository<PayrollBenefitAdjustment>,
    @InjectRepository(BenefitAdjustmentType)
    private readonly adjustmentTypeRepo: Repository<BenefitAdjustmentType>,
    private readonly dataSource: DataSource,
    private readonly utilityService: UtilityService,
    @InjectRepository(PayrollReport)
    private readonly payrollReportRepo: Repository<PayrollReport>,
    @InjectRepository(BenefitComponent)
    private readonly benefitComponentRepo: Repository<BenefitComponent>,
    private readonly validateApprovalStatusService: ApprovalStatusTrackingValidationService,
    private readonly grpcService: GrpcService,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(EmployeeMovementRepository)
    private readonly employeeMovementRepo: IEmployeeMovementRepository
  ) {}

  async create(
    createPayrollBenefitAdjustmentDto: CreatePayrollBenefitAdjustmentDto
  ) {
    const query = this.dataSource.createQueryRunner();
    try {
      await query.connect();
      await query.startTransaction();

      //validate benefit adjustment type
      await this.validateAdjustmentType(
        createPayrollBenefitAdjustmentDto.adjustmentTypeId,
        createPayrollBenefitAdjustmentDto.employeeMovementId
      );

      //validate employee movement
      await this.validateEmployeeMovementById(
        createPayrollBenefitAdjustmentDto.employeeMovementId,
        createPayrollBenefitAdjustmentDto.employeeId
      );

      const employee = await this.employeeRepo.getEmployeeById(
        createPayrollBenefitAdjustmentDto.employeeId
      );
      const isAdmin = await this.utilityService.checkIsAdmin();
      let result: any;
      if (!isAdmin) {
        result = await this.utilityService.validateWithWorkflow(
          employee,
          RequestWorkFlowTypeEnum.PAYROLL_BENEFIT_ADJUSTMENT
        );
      }

      const payrollBenefitAdjustment = query.manager.create(
        PayrollBenefitAdjustment,
        {
          employee: { id: createPayrollBenefitAdjustmentDto.employeeId },
          adjustmentType: {
            id: createPayrollBenefitAdjustmentDto.adjustmentTypeId
          },
          reason: createPayrollBenefitAdjustmentDto.reason,
          employeeMovement: {
            id: createPayrollBenefitAdjustmentDto.employeeMovementId
          },
          status: isAdmin ? StatusEnum.ACTIVE : StatusEnum.PENDING
        }
      );
      const payrollAdjustmentData = await query.manager.save(
        payrollBenefitAdjustment
      );

      if (payrollAdjustmentData) {
        if (createPayrollBenefitAdjustmentDto.detail?.length) {
          for (const item of createPayrollBenefitAdjustmentDto.detail) {
            let effectiveDateFrom: string;
            if (item.effectiveDateFrom) {
              effectiveDateFrom = isValidDate(item.effectiveDateFrom);
            }

            let effectiveDateTo: string;
            if (item.effectiveDateTo) {
              effectiveDateTo = isValidDate(item.effectiveDateTo);
            }
            await this.checkBenefitComponentId(item.benefitComponentId, query);
            const payrollAdjustmentDetail: PayrollBenefitAdjustmentDetail =
              query.manager.create(PayrollBenefitAdjustmentDetail, {
                ...item,
                effectiveDateFrom,
                effectiveDateTo,
                adjustAmount: item.adjustAmount,
                payrollBenefitAdjustment: { id: payrollAdjustmentData.id },
                benefitComponent: { id: item.benefitComponentId },
                status: payrollAdjustmentData.status as any
              });
            await query.manager.save(payrollAdjustmentDetail);
          }
        }
      }

      if (!isAdmin) {
        const approvalStatusDto: CreateApprovalStatusTrackingDto = {
          approvalWorkflowId: result.requestApprovalWorkflowId,
          requestWorkflowTypeId: result.workflowTypeId,
          entityId: payrollAdjustmentData.id,
          requestToUpdateBy: null,
          requestToUpdateChange: null,
          requestToUpdateJson: null,
          firstApprovalUserId: null,
          secondApprovalUserId: null,
          status: ApprovalStatusEnum.PENDING
        };

        await this.utilityService.createApprovalStatus(
          approvalStatusDto,
          result.requesterPosition,
          employee.id
        );
      }
      if (payrollAdjustmentData.status === StatusEnum.ACTIVE) {
        const payrollBenefitAdjustment = await query.manager
          .getRepository(PayrollBenefitAdjustment)
          .findOne({
            where: { id: payrollAdjustmentData.id },
            relations: {
              payrollBenefitAdjustmentDetail: { benefitComponent: true },
              employee: true
            }
          });

        await this.updatePayrollBenefitAdjustmentDetailStatus(
          payrollBenefitAdjustment.payrollBenefitAdjustmentDetail,
          query
        );
      }
      await query.commitTransaction();
      return payrollAdjustmentData;
    } catch (exception) {
      Logger.error(exception);
      await query.rollbackTransaction();
      handleResourceConflictException(
        exception,
        payrollConstraint,
        createPayrollBenefitAdjustmentDto
      );
    } finally {
      query.release();
    }
  }

  async exportPayrollAdjustmentFile(
    pagination: PaginationPayrollAdjustmentDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.PAYROLL_BENEFIT_ADJUSTMENT,
      exportFileDto,
      data
    );
  }

  async findAll(paginate: PaginationPayrollAdjustmentDto) {
    const employeeIds: number[] = await this.utilityService.getCurrentUserMpath(
      paginate.employeeId
    );
    return GetPagination(this.payrollBenefitAdjustmentRepo, paginate, [], {
      where: {
        employee: {
          id: In(employeeIds),
          status: In(Object.values(EmployeeActiveStatusEnum)),
          positions: {
            isMoved: false,
            companyStructurePosition: { id: paginate.positionId ?? null },
            companyStructureTeam: { id: paginate.divisionId ?? null },
            companyStructureDepartment: { id: paginate.departmentId ?? null },
            companyStructureOutlet: { id: paginate.storeId ?? null },
            companyStructureLocation: { id: paginate.locationId ?? null }
          }
        },
        payrollBenefitAdjustmentDetail: {
          benefitComponent: { id: paginate.salaryComponentId ?? null }
        },
        status: paginate.status ?? AdjustmentDetailStatusEnum.ACTIVE
      },
      relation: {
        employeeMovement: true,
        payrollBenefitAdjustmentDetail: { benefitComponent: true },
        adjustmentType: true,
        employee: {
          positions: {
            companyStructureCompany: { companyStructureComponent: true },
            companyStructureLocation: { companyStructureComponent: true },
            companyStructureOutlet: { companyStructureComponent: true },
            companyStructureDepartment: { companyStructureComponent: true },
            companyStructureTeam: { companyStructureComponent: true },
            companyStructurePosition: { companyStructureComponent: true }
          }
        }
      },
      select: {
        payrollBenefitAdjustmentDetail: {
          id: true,
          adjustAmount: true,
          effectiveDateFrom: true,
          effectiveDateTo: true,
          benefitComponent: { id: true, name: true }
        }
      },
      mapFunction: (payrollBenefitAdjustment: PayrollBenefitAdjustment) => {
        const employee = payrollBenefitAdjustment.employee;
        return {
          ...payrollBenefitAdjustment,
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
    });
  }

  async findOne(id: number): Promise<PayrollBenefitAdjustment> {
    const adjustment: PayrollBenefitAdjustment =
      await this.payrollBenefitAdjustmentRepo.findOne({
        where: {
          id
        },
        relations: {
          employeeMovement: true,
          payrollBenefitAdjustmentDetail: {
            benefitComponent: true
          },
          adjustmentType: true,
          employee: {
            positions: {
              companyStructureCompany: { companyStructureComponent: true },
              companyStructureLocation: { companyStructureComponent: true },
              companyStructureOutlet: { companyStructureComponent: true },
              companyStructureDepartment: { companyStructureComponent: true },
              companyStructureTeam: { companyStructureComponent: true },
              companyStructurePosition: { companyStructureComponent: true }
            }
          }
        },
        select: {
          employee: {
            id: true,
            displayFullNameEn: true,
            accountNo: true,
            positions: {
              id: true,
              companyStructureCompany: {
                id: true,
                companyStructureComponent: { id: true, name: true, type: true }
              },
              companyStructureLocation: {
                id: true,
                companyStructureComponent: { id: true, name: true, type: true }
              },
              companyStructureOutlet: {
                id: true,
                companyStructureComponent: { id: true, name: true, type: true }
              },
              companyStructureDepartment: {
                id: true,
                companyStructureComponent: { id: true, name: true, type: true }
              },
              companyStructureTeam: {
                id: true,
                companyStructureComponent: { id: true, name: true, type: true }
              },
              companyStructurePosition: {
                id: true,
                companyStructureComponent: { id: true, name: true, type: true }
              }
            }
          }
        }
      });

    if (!adjustment) {
      throw new ResourceNotFoundException('payroll benefit adjustment', id);
    }

    adjustment['adjustmentTotalAmount'] = 0;
    adjustment?.payrollBenefitAdjustmentDetail.forEach(
      (adjustmentDetail: PayrollBenefitAdjustmentDetail) => {
        adjustment['adjustmentTotalAmount'] =
          Number(adjustment['adjustmentTotalAmount']) +
          Number(adjustmentDetail.adjustAmount);
      }
    );

    const payrollBenefitAdjustment: PayrollBenefitAdjustment =
      await this.payrollBenefitAdjustmentRepo.findOne({
        where: {
          id: LessThan(adjustment.id),
          employee: { id: adjustment.employee.id }
        },
        order: {
          id: 'DESC'
        },
        relations: {
          payrollBenefitAdjustmentDetail: {
            benefitComponent: true
          },
          employee: true
        }
      });

    if (payrollBenefitAdjustment) {
      let lastAdjustmentAmount = 0;
      payrollBenefitAdjustment?.payrollBenefitAdjustmentDetail.forEach(
        (adjustmentDetail: PayrollBenefitAdjustmentDetail) => {
          lastAdjustmentAmount += Number(adjustmentDetail.adjustAmount);
        }
      );
      adjustment['lastAdjustmentDate'] =
        payrollBenefitAdjustment?.createdAt ?? null;
      adjustment['lastAdjustmentAmount'] = lastAdjustmentAmount;
    }
    return adjustment;
  }

  async update(
    id: number,
    updatePayrollBenefitAdjustmentDto: UpdatePayrollBenefitAdjustmentDto
  ) {
    const query = this.dataSource.createQueryRunner();
    await query.connect();
    await query.startTransaction();
    try {
      if (updatePayrollBenefitAdjustmentDto.employeeId) {
        await this.employeeRepo.getEmployeeById(
          updatePayrollBenefitAdjustmentDto.employeeId
        );
      }

      let payrollBenefitAdjustment: PayrollBenefitAdjustment =
        await this.findOne(id);
      validateByStatusActive(payrollBenefitAdjustment.status);

      // check if current user is creator or not.
      await this.utilityService.checkCurrentUserIsCreatorOrNot(
        payrollBenefitAdjustment.createdBy
      );

      //validate benefit adjustment type
      if (updatePayrollBenefitAdjustmentDto.adjustmentTypeId) {
        if (!updatePayrollBenefitAdjustmentDto.employeeMovementId) {
          updatePayrollBenefitAdjustmentDto.employeeMovementId =
            payrollBenefitAdjustment.employeeMovement.id;
        }

        await this.validateAdjustmentType(
          updatePayrollBenefitAdjustmentDto.adjustmentTypeId,
          updatePayrollBenefitAdjustmentDto.employeeMovementId
        );
      }

      //validate employee movement
      if (updatePayrollBenefitAdjustmentDto.employeeMovementId) {
        await this.validateEmployeeMovementById(
          updatePayrollBenefitAdjustmentDto.employeeMovementId,
          updatePayrollBenefitAdjustmentDto.employeeId ??
            payrollBenefitAdjustment.employee.id
        );
      }

      payrollBenefitAdjustment = query.manager.create(
        PayrollBenefitAdjustment,
        {
          id: id,
          employee: { id: updatePayrollBenefitAdjustmentDto.employeeId },
          adjustmentType: {
            id: updatePayrollBenefitAdjustmentDto.adjustmentTypeId
          },
          employeeMovement: {
            id: updatePayrollBenefitAdjustmentDto.employeeMovementId
          },
          reason: updatePayrollBenefitAdjustmentDto.reason
        }
      );

      const payrollAdjustmentData = await query.manager.save(
        payrollBenefitAdjustment
      );

      if (payrollAdjustmentData) {
        //update payroll adjustment detail if existing
        await this.createOrUpdatePayrollBenefitAdjustmentDetail(
          payrollAdjustmentData,
          updatePayrollBenefitAdjustmentDto.detail,
          query
        );
      }
      await query.commitTransaction();
      return payrollAdjustmentData;
    } catch (exception) {
      Logger.error(exception);
      await query.rollbackTransaction();
      handleResourceConflictException(
        exception,
        payrollConstraint,
        updatePayrollBenefitAdjustmentDto
      );
    } finally {
      query.release();
    }
  }

  async checkBenefitComponentId(
    salaryComponentId: number,
    queryRunner: QueryRunner
  ): Promise<void> {
    const salaryComponent: BenefitComponent = await queryRunner.manager
      .getRepository(BenefitComponent)
      .findOne({ where: { id: salaryComponentId } });

    if (!salaryComponent) {
      throw new ResourceNotFoundException(
        'salary component',
        salaryComponentId
      );
    }
  }

  async createOrUpdatePayrollBenefitAdjustmentDetail(
    payrollAdjustment: PayrollBenefitAdjustment,
    payrollBenefitAdjustmentDetails: CreatePayrollBenefitAdjustmentDetailDto[],
    queryRunner: QueryRunner
  ): Promise<void> {
    if (payrollBenefitAdjustmentDetails.length) {
      const payrollBenefitAdjustment: PayrollBenefitAdjustment =
        await this.findOne(payrollAdjustment.id);
      const ids: number[] =
        payrollBenefitAdjustment.payrollBenefitAdjustmentDetail.map(
          (detail: PayrollBenefitAdjustmentDetail) => detail.id
        );

      await queryRunner.manager.delete(PayrollBenefitAdjustmentDetail, ids);
      // add new or update payroll benefit adjustment detail
      for (const item of payrollBenefitAdjustmentDetails) {
        await this.checkBenefitComponentId(
          item.benefitComponentId,
          queryRunner
        );

        const payrollBenefitAdjustmentDetail: PayrollBenefitAdjustmentDetail =
          queryRunner.manager.create(PayrollBenefitAdjustmentDetail, {
            ...item,
            adjustAmount: item.adjustAmount,
            payrollBenefitAdjustment: {
              id: payrollAdjustment.id
            },
            benefitComponent: { id: item.benefitComponentId }
          });

        await queryRunner.manager.save(payrollBenefitAdjustmentDetail);
      }
    }
  }

  async delete(id: number) {
    await this.validateApprovalStatusService.deleteEntityById(
      id,
      MediaEntityTypeEnum.PAYROLL_BENEFIT_ADJUSTMENT
    );
  }

  getAdjustmentType() {
    return this.adjustmentTypeRepo.find();
  }

  async updateStatus(
    entityId: number,
    status: ApprovalStatusEnum
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const payrollBenefitAdjustment: PayrollBenefitAdjustment =
        await this.payrollBenefitAdjustmentRepo.findOne({
          where: { id: entityId },
          relations: {
            payrollBenefitAdjustmentDetail: { benefitComponent: true },
            employee: true
          },
          select: { employee: { id: true } }
        });

      if (!payrollBenefitAdjustment) {
        throw new ResourceNotFoundException(
          'payroll benefit adjustment',
          entityId
        );
      }

      const payrollBenefitAdjustmentDto: PayrollBenefitAdjustment =
        queryRunner.manager.create(PayrollBenefitAdjustment, {
          ...payrollBenefitAdjustment,
          status
        });

      await queryRunner.manager.save(payrollBenefitAdjustmentDto);
      await queryRunner.commitTransaction();
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      handleResourceConflictException(exception, payrollConstraint);
    } finally {
      await queryRunner.release();
    }
  }

  getCurrentDate() {
    const dateTime = new Date();
    const currentDate: any = dayJs(dateTime)
      .utc(true)
      .format(DEFAULT_DATE_FORMAT);

    return currentDate;
  }

  async getAllPayrollBenefitHistory(employeeId: number, year: number) {
    //payroll benefit history for Jan
    const payrollBenefitHistoryJan =
      await this.getPayrollBenefitHistoryBaseOnYearAndMonth(
        '01',
        year,
        employeeId,
        'Jan'
      );

    //payroll benefit history for Feb
    const payrollBenefitHistoryFeb =
      await this.getPayrollBenefitHistoryBaseOnYearAndMonth(
        '02',
        year,
        employeeId,
        'Feb'
      );

    //payroll benefit history for Match
    const payrollBenefitHistoryMar =
      await this.getPayrollBenefitHistoryBaseOnYearAndMonth(
        '03',
        year,
        employeeId,
        'Mar'
      );

    //payroll benefit history for Apr
    const payrollBenefitHistoryApr =
      await this.getPayrollBenefitHistoryBaseOnYearAndMonth(
        '04',
        year,
        employeeId,
        'Apr'
      );

    //payroll benefit history for May
    const payrollBenefitHistoryMay =
      await this.getPayrollBenefitHistoryBaseOnYearAndMonth(
        '05',
        year,
        employeeId,
        'May'
      );
    //payroll benefit history for June
    const payrollBenefitHistoryJune =
      await this.getPayrollBenefitHistoryBaseOnYearAndMonth(
        '06',
        year,
        employeeId,
        'June'
      );
    //payroll benefit history for July
    const payrollBenefitHistoryJuly =
      await this.getPayrollBenefitHistoryBaseOnYearAndMonth(
        '07',
        year,
        employeeId,
        'July'
      );
    //payroll benefit history for Aug
    const payrollBenefitHistoryAug =
      await this.getPayrollBenefitHistoryBaseOnYearAndMonth(
        '08',
        year,
        employeeId,
        'Aug'
      );
    //payroll benefit history for Sep
    const payrollBenefitHistorySep =
      await this.getPayrollBenefitHistoryBaseOnYearAndMonth(
        '09',
        year,
        employeeId,
        'Sep'
      );
    //payroll benefit history for oct
    const payrollBenefitHistoryOct =
      await this.getPayrollBenefitHistoryBaseOnYearAndMonth(
        '10',
        year,
        employeeId,
        'Oct'
      );
    //payroll benefit history for Nov
    const payrollBenefitHistoryNov =
      await this.getPayrollBenefitHistoryBaseOnYearAndMonth(
        '11',
        year,
        employeeId,
        'Nov'
      );
    //payroll benefit history for Dec
    const payrollBenefitHistoryDec =
      await this.getPayrollBenefitHistoryBaseOnYearAndMonth(
        '12',
        year,
        employeeId,
        'Dec'
      );

    return {
      ...payrollBenefitHistoryJan,
      ...payrollBenefitHistoryFeb,
      ...payrollBenefitHistoryMar,
      ...payrollBenefitHistoryApr,
      ...payrollBenefitHistoryMay,
      ...payrollBenefitHistoryJune,
      ...payrollBenefitHistoryJuly,
      ...payrollBenefitHistoryAug,
      ...payrollBenefitHistorySep,
      ...payrollBenefitHistoryOct,
      ...payrollBenefitHistoryNov,
      ...payrollBenefitHistoryDec
    };
  }

  async getPayrollBenefitHistoryBaseOnYearAndMonth(
    month: string,
    year: number,
    employeeId: number,
    monthPrefix: string
  ): Promise<any> {
    const dateTime = `${year}/${month}/01`;
    const startDate: any = dayJs(dateTime)
      .startOf('month')
      .format(DEFAULT_DATE_TIME_FORMAT);
    const endDate: any = dayJs(startDate)
      .endOf('month')
      .format(DEFAULT_DATE_TIME_FORMAT);

    const payrollReport: PayrollReport = await this.payrollReportRepo.findOne({
      where: {
        employee: { id: employeeId },
        date: Between(startDate, endDate),
        payrollReportDetail: { type: PayrollReportTypeEnum.BENEFIT }
      },
      relations: {
        payrollReportDetail: true,
        employee: { workingShiftId: { workshiftType: { workingShift: true } } }
      },
      select: { employee: { id: true } }
    });
    return await this.mappingPayrollBenefitHistory(
      await this.getPayrollBenefitAdjustment(startDate, endDate, employeeId),
      monthPrefix,
      payrollReport
    );
  }

  async getPayrollBenefitAdjustment(
    fromDate: any,
    toDate: any,
    employeeId: number
  ) {
    const payrollBenefitAdjustments =
      await this.payrollBenefitAdjustmentRepo.find({
        where: {
          status: StatusEnum.ACTIVE,
          employee: { id: employeeId },
          payrollBenefitAdjustmentDetail: {
            isPostProbation: false,
            effectiveDateFrom: Between(fromDate, toDate)
          }
        } as FindOptionsWhere<PayrollBenefitAdjustment>,
        select: PAYROLL_BENEFIT_SELECTED_FIELDS,
        relations: PAYROLL_BENEFIT_RELATIONSHIP
      });

    return this.calculatePayrollBenefitAdjustment(payrollBenefitAdjustments);
  }

  calculatePayrollBenefitAdjustment(
    payrollBenefitAdjustments: PayrollBenefitAdjustment[]
  ): PayrollBenefitAdjustmentDetail[] {
    if (payrollBenefitAdjustments.length) {
      const payrollBenefitAdjustmentDetails: PayrollBenefitAdjustmentDetail[] =
        this.combineAdjustmentDetailsOfAdjustment(payrollBenefitAdjustments);

      return this.calculatePayrollBenefitAdjustmentDetailAmount(
        payrollBenefitAdjustmentDetails
      );
    }
  }

  calculatePayrollBenefitAdjustmentDetailAmount(
    payrollBenefitAdjustmentDetails: PayrollBenefitAdjustmentDetail[]
  ): PayrollBenefitAdjustmentDetail[] {
    const uniqueAdjustmentDetails: PayrollBenefitAdjustmentDetail[] = [];
    if (payrollBenefitAdjustmentDetails.length) {
      payrollBenefitAdjustmentDetails.forEach(
        (adjustmentDetail: PayrollBenefitAdjustmentDetail) => {
          //find duplicate adjustment detail
          const { benefitAdjustmentDetail, benefitAdjustmentDetailIndex } =
            this.findDuplicateAdjustmentDetail(
              adjustmentDetail,
              uniqueAdjustmentDetails
            );

          if (!benefitAdjustmentDetail) {
            uniqueAdjustmentDetails.push(adjustmentDetail);
          } else {
            uniqueAdjustmentDetails[
              benefitAdjustmentDetailIndex
            ].adjustAmount += Number(adjustmentDetail.adjustAmount);
          }
        }
      );
    }
    return uniqueAdjustmentDetails;
  }

  combineAdjustmentDetailsOfAdjustment(
    payrollBenefitAdjustments: PayrollBenefitAdjustment[]
  ): PayrollBenefitAdjustmentDetail[] {
    const payrollBenefitAdjustmentDetails: PayrollBenefitAdjustmentDetail[] =
      [];

    payrollBenefitAdjustments.forEach(
      (payrollBenefitAdjustment: PayrollBenefitAdjustment) => {
        payrollBenefitAdjustmentDetails.push(
          ...payrollBenefitAdjustment.payrollBenefitAdjustmentDetail
        );
      }
    );

    return payrollBenefitAdjustmentDetails;
  }

  findDuplicateAdjustmentDetail(
    adjustmentDetail: PayrollBenefitAdjustmentDetail,
    uniqueAdjustmentDetails: PayrollBenefitAdjustmentDetail[]
  ) {
    let benefitAdjustmentDetailIndex = 0;
    return {
      benefitAdjustmentDetail: uniqueAdjustmentDetails.find(
        (item: PayrollBenefitAdjustmentDetail, index: number) => {
          benefitAdjustmentDetailIndex = index;
          return (
            item.benefitComponent.id === adjustmentDetail.benefitComponent.id
          );
        }
      ),
      benefitAdjustmentDetailIndex
    };
  }

  async mappingPayrollBenefitHistory(
    payrollBenefitAdjustmentDetails: PayrollBenefitAdjustmentDetail[],
    monthPrefix: string,
    payrollReport: PayrollReport
  ) {
    const attendanceAllowance = await this.validateEmployeeType(
      payrollReport?.employee,
      payrollReport
    );
    const payloadBenefitHistory: any = [];
    let totalCompensation = 0;
    const benefitComponents = await this.benefitComponentRepo.find();
    if (!payrollBenefitAdjustmentDetails?.length) {
      if (!benefitComponents.length) {
        return { [`${monthPrefix}`]: { totalCompensation: 0 } };
      }
      benefitComponents.forEach((benefitComponent: BenefitComponent) => {
        payloadBenefitHistory.push({
          [`${benefitComponent.name}`]: 0
        });
      });
    } else if (benefitComponents.length) {
      totalCompensation = await this.sumDuplicateDetails(
        payrollBenefitAdjustmentDetails,
        benefitComponents,
        attendanceAllowance,
        payloadBenefitHistory
      );

      this.mappingBenefitComponent(
        benefitComponents,
        payloadBenefitHistory,
        attendanceAllowance
      );
    }

    return {
      [`${monthPrefix}`]: Object.assign({}, ...payloadBenefitHistory, {
        totalCompensation
      })
    };
  }

  async sumDuplicateDetails(
    payrollBenefitAdjustmentDetails: PayrollBenefitAdjustmentDetail[],
    benefitComponents: BenefitComponent[],
    attendanceAllowance: number,
    payloadBenefitHistory: any
  ) {
    let totalCompensation = 0;
    for (const payrollAdjustmentDetail of payrollBenefitAdjustmentDetails) {
      // check duplicate index
      const { benefitComponent, benefitComponentIndex } =
        this.findDuplicateBenefitComponent(
          benefitComponents,
          payrollAdjustmentDetail
        );

      totalCompensation =
        Number(totalCompensation) +
        Number(payrollAdjustmentDetail.adjustAmount);
      if (benefitComponent) {
        if (
          payrollAdjustmentDetail.benefitComponent.name === ATTENDANCE_ALLOWANCE
        ) {
          payloadBenefitHistory.push({
            [`${payrollAdjustmentDetail.benefitComponent.name}`]:
              attendanceAllowance
          });
        } else {
          payloadBenefitHistory.push({
            [`${payrollAdjustmentDetail.benefitComponent.name}`]:
              payrollAdjustmentDetail.adjustAmount
          });
        }

        benefitComponents.splice(benefitComponentIndex, 1);
      }
    }

    return totalCompensation;
  }

  findDuplicateBenefitComponent(
    benefitComponents: BenefitComponent[],
    payrollAdjustmentDetail: PayrollBenefitAdjustmentDetail
  ) {
    let benefitComponentIndex: number;
    return {
      benefitComponent: benefitComponents.find(
        (benefitComponent: BenefitComponent, index: number) => {
          benefitComponentIndex = index;
          if (
            benefitComponent.id === payrollAdjustmentDetail?.benefitComponent.id
          ) {
            return benefitComponent;
          }
        }
      ),
      benefitComponentIndex
    };
  }

  mappingBenefitComponent(
    benefitComponents: BenefitComponent[],
    payloadBenefitHistory: any,
    attendanceAllowance: number
  ) {
    for (const benefitComponent of benefitComponents) {
      if (benefitComponent.name === ATTENDANCE_ALLOWANCE) {
        payloadBenefitHistory.push({
          [`${benefitComponent.name}`]: attendanceAllowance
        });
      } else {
        payloadBenefitHistory.push({
          [`${benefitComponent.name}`]: 0
        });
      }
    }

    return payloadBenefitHistory;
  }

  async exportPayrollBenefitFile(
    pagination: PaginationPayrollBenefitDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.getCurrentPayrollBenefit(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.PAYROLL_BENEFIT,
      exportFileDto,
      data
    );
  }

  async getCurrentPayrollBenefit(pagination: PaginationPayrollBenefitDto) {
    const dateTime = this.getCurrentDate();
    const currentDate: any = dayJs(dateTime)
      .utc(true)
      .format(DEFAULT_DATE_FORMAT);

    if (pagination.orderBy) {
      this.handlePaginationOrderBy(pagination);
    }
    const data = await GetPagination(
      this.payrollBenefitAdjustmentRepo,
      pagination,
      [],
      {
        where: [
          {
            status: StatusEnum.ACTIVE,
            employee: { id: pagination.employeeId },
            payrollBenefitAdjustmentDetail: {
              isPostProbation: false,
              effectiveDateFrom: LessThanOrEqual(currentDate),
              effectiveDateTo: IsNull()
            }
          },
          {
            status: StatusEnum.ACTIVE,
            employee: { id: pagination.employeeId },
            payrollBenefitAdjustmentDetail: {
              isPostProbation: false,
              effectiveDateFrom: LessThanOrEqual(currentDate),
              effectiveDateTo: MoreThanOrEqual(currentDate)
            }
          }
        ] as FindOptionsWhere<PayrollBenefitAdjustment>,
        relation: PAYROLL_BENEFIT_RELATIONSHIP,
        select: PAYROLL_BENEFIT_SELECTED_FIELDS
      }
    );

    let benefits: any;

    if (data.data.length) {
      data.data = this.getUniquePayrollBenefitAdjustmentEmployee(data.data);
      benefits = await Promise.all(
        data.data.map(async (payrollAdjustment: PayrollBenefitAdjustment) => {
          return await this.mappingEmployeePayrollBenefit(
            payrollAdjustment.payrollBenefitAdjustmentDetail,
            payrollAdjustment.employee
          );
        })
      );
    } else {
      const benefitComponent = await this.benefitComponentRepo.findOne({
        where: { name: ATTENDANCE_ALLOWANCE }
      });
      const employee = await this.employeeRepo.getEmployeeById(
        pagination.employeeId
      );
      const attendanceAllowance = await this.validateEmployeeType(employee);
      data.data.push({
        [benefitComponent.name]: attendanceAllowance
      } as any);
    }

    return {
      data: data.data.length ? benefits : data.data,
      totalCount: data.totalCount
    };
  }

  getUniquePayrollBenefitAdjustmentEmployee(
    payrollAdjustments: PayrollBenefitAdjustment[]
  ): PayrollBenefitAdjustment[] {
    const duplicateBenefitsData: PayrollBenefitAdjustment[] = [];
    let benefitAdjustmentIndex = 0;

    payrollAdjustments.forEach(
      (payrollAdjustment: PayrollBenefitAdjustment) => {
        const uniqueAdjustments: PayrollBenefitAdjustment[] = [];
        const duplicateBenefit = uniqueAdjustments.find(
          (adjustment: PayrollBenefitAdjustment, index: number) => {
            benefitAdjustmentIndex = index;
            if (
              adjustment &&
              adjustment?.employee?.id === payrollAdjustment?.employee?.id
            ) {
              return adjustment;
            }
          }
        );
        if (!duplicateBenefit) {
          duplicateBenefitsData.push(payrollAdjustment);
        } else {
          duplicateBenefitsData[
            benefitAdjustmentIndex
          ].payrollBenefitAdjustmentDetail.push(
            ...payrollAdjustment.payrollBenefitAdjustmentDetail
          );
        }
      }
    );
    return duplicateBenefitsData;
  }

  async mappingEmployeePayrollBenefit(
    payrollBenefitAdjustmentDetails: PayrollBenefitAdjustmentDetail[],
    employee: Employee
  ) {
    const uniqueAdjustmentDetails = [];
    payrollBenefitAdjustmentDetails.forEach(
      (benefitAdjustmentDetail: PayrollBenefitAdjustmentDetail) => {
        const duplicate = uniqueAdjustmentDetails.find(
          (adjustmentDetail: PayrollBenefitAdjustmentDetail) => {
            if (
              adjustmentDetail?.benefitComponent?.name ===
              benefitAdjustmentDetail.benefitComponent.name
            ) {
              adjustmentDetail.adjustAmount += Number(
                benefitAdjustmentDetail.adjustAmount
              );
              return adjustmentDetail;
            }
          }
        );

        if (!duplicate) {
          uniqueAdjustmentDetails.push(benefitAdjustmentDetail);
        }
      }
    );

    const attendanceAllowance = await this.validateEmployeeType(employee);
    const benefitComponents = await this.benefitComponentRepo.find();
    let totalCompensation = 0;
    const payloadBenefitResponse: any = [];

    if (!payrollBenefitAdjustmentDetails.length) {
      if (!benefitComponents.length) {
        return { ['Total Compensation']: 0 };
      }

      benefitComponents.forEach((benefitComponent: BenefitComponent) => {
        payloadBenefitResponse.push({
          [benefitComponent.name]: 0
        });
      });
    } else if (benefitComponents.length) {
      for (const payrollBenefitAdjustmentDetail of uniqueAdjustmentDetails) {
        let benefitComponentIndex: number;
        const benefitComponent = benefitComponents.find(
          (benefitComponent: BenefitComponent, index: number) => {
            benefitComponentIndex = index;
            if (
              benefitComponent.id ===
              payrollBenefitAdjustmentDetail.benefitComponent.id
            ) {
              return benefitComponent;
            }
          }
        );

        if (benefitComponent) {
          if (
            payrollBenefitAdjustmentDetail.benefitComponent?.name ===
            ATTENDANCE_ALLOWANCE
          ) {
            payloadBenefitResponse.push({
              [benefitComponent.name]: attendanceAllowance
            });
            totalCompensation =
              Number(totalCompensation) + Number(attendanceAllowance);
          } else {
            totalCompensation =
              Number(totalCompensation) +
              Number(payrollBenefitAdjustmentDetail.adjustAmount);
            payloadBenefitResponse.push({
              [payrollBenefitAdjustmentDetail.benefitComponent.name]:
                payrollBenefitAdjustmentDetail.adjustAmount
            });
          }

          benefitComponents.splice(benefitComponentIndex, 1);
        }
      }

      benefitComponents.forEach((benefitComponent: BenefitComponent) => {
        if (benefitComponent.name === ATTENDANCE_ALLOWANCE) {
          payloadBenefitResponse.push({
            [benefitComponent.name]: attendanceAllowance
          });
          totalCompensation =
            Number(totalCompensation) + Number(attendanceAllowance);
        } else {
          payloadBenefitResponse.push({
            [benefitComponent.name]: 0
          });
        }
      });
    }
    return Object.assign(
      {},
      { employee: this.mappingEmployee(employee) },
      ...payloadBenefitResponse,
      {
        ['Total Compensation']: totalCompensation
      }
    );
  }

  mappingEmployee(employee: Employee) {
    return {
      id: employee?.id,
      accountNo: employee?.accountNo,
      displayFullNameEn: employee?.displayFullNameEn,
      location:
        employee?.positions[0].companyStructureLocation
          ?.companyStructureComponent?.name,
      outlet:
        employee?.positions[0]?.companyStructureOutlet
          ?.companyStructureComponent?.name,
      department:
        employee?.positions[0]?.companyStructureDepartment
          ?.companyStructureComponent?.name,
      team: employee?.positions[0]?.companyStructureTeam
        ?.companyStructureComponent?.name,
      position:
        employee?.positions[0]?.companyStructurePosition
          ?.companyStructureComponent?.name
    };
  }

  async validateEmployeeType(
    employee: Employee,
    payrollReport?: PayrollReport
  ): Promise<number> {
    if (employee) {
      const isValidType =
        employee.workingShiftId.workshiftType.name ===
          WorkShiftTypeEnum.ROSTER &&
        (employee.status === EmployeeStatusEnum.ACTIVE ||
          employee.attendanceAllowanceInProbation);

      if (isValidType && !payrollReport) {
        const globalConfiguration =
          await this.grpcService.getGlobalConfigurationByName({
            name: 'attendance-allowance'
          });

        if (globalConfiguration) {
          return Number(globalConfiguration.value);
        }
      } else {
        return payrollReport?.attendanceAllowanceByConfiguration ?? 0;
      }
    }

    return 0;
  }

  handlePaginationOrderBy(pagination: PaginationPayrollBenefitDto) {
    if (pagination.orderBy) {
      switch (pagination.orderBy) {
        case 'employeeId':
          pagination.orderBy = 'id';
          break;
        case 'location':
          pagination.orderBy =
            'positions.companyStructureLocation.companyStructureComponent.name';
          break;
        case 'outlet':
          pagination.orderBy =
            'positions.companyStructureOutlet.companyStructureComponent.name';
          break;
        case 'department':
          pagination.orderBy =
            'positions.companyStructureDepartment.companyStructureComponent.name';
          break;
        case 'team':
          pagination.orderBy =
            'positions.companyStructureTeam.companyStructureComponent.name';
          break;
        case 'position':
          pagination.orderBy =
            'positions.companyStructurePosition.companyStructureComponent.name';
          break;
        default:
          break;
      }
    }
  }

  async getPayrollBenefitAdjustmentForAdjustment(
    adjustmentId: number,
    pagination: PaginationPayrollBenefitDto
  ) {
    const payrollBenefitAdjustment: PayrollBenefitAdjustment =
      await this.getPayrollBenefitAdjustmentById(adjustmentId);

    const createdAt: string = dayJs(payrollBenefitAdjustment.createdAt)
      .utc(true)
      .format(DEFAULT_DATE_FORMAT);

    const data = await GetPagination(
      this.payrollBenefitAdjustmentRepo,
      pagination,
      [],
      {
        where: [
          {
            createdAt: LessThanOrEqual(payrollBenefitAdjustment.createdAt),
            id: LessThan(payrollBenefitAdjustment.id),
            employee: { id: payrollBenefitAdjustment.employee.id },
            payrollBenefitAdjustmentDetail: {
              isPostProbation: false,
              effectiveDateFrom: LessThanOrEqual(createdAt),
              effectiveDateTo: LessThanOrEqual(createdAt)
            }
          },
          {
            createdAt: LessThanOrEqual(payrollBenefitAdjustment.createdAt),
            id: LessThan(payrollBenefitAdjustment.id),
            employee: { id: payrollBenefitAdjustment.employee.id },
            payrollBenefitAdjustmentDetail: {
              isPostProbation: false,
              effectiveDateFrom: LessThanOrEqual(createdAt),
              effectiveDateTo: IsNull()
            }
          }
        ] as FindOptionsWhere<PayrollBenefitAdjustment>,
        relation: PAYROLL_BENEFIT_RELATIONSHIP,
        select: PAYROLL_BENEFIT_SELECTED_FIELDS
      }
    );

    let benefits: any;
    if (data.data.length) {
      data.data = this.getUniquePayrollBenefitAdjustmentEmployee(data.data);
      benefits = await Promise.all(
        data.data.map(async (payrollAdjustment: PayrollBenefitAdjustment) => {
          return await this.mappingEmployeePayrollBenefit(
            payrollAdjustment.payrollBenefitAdjustmentDetail,
            payrollAdjustment.employee
          );
        })
      );
    } else {
      const benefitComponent = await this.benefitComponentRepo.findOne({
        where: { name: ATTENDANCE_ALLOWANCE }
      });
      const employee = await this.employeeRepo.getEmployeeById(
        pagination.employeeId
      );
      const attendanceAllowance = await this.validateEmployeeType(employee);
      data.data.push({
        [benefitComponent.name]: attendanceAllowance
      } as any);
    }

    return {
      data: data.data.length ? benefits : data,
      totalCount: data.totalCount
    };
  }

  async getPayrollBenefitAdjustmentById(
    id: number
  ): Promise<PayrollBenefitAdjustment> {
    const payrollBenefitAdjustment: PayrollBenefitAdjustment =
      await this.payrollBenefitAdjustmentRepo.findOne({
        where: { id },
        relations: { employee: true },
        select: { employee: { id: true } }
      });

    if (!payrollBenefitAdjustment) {
      throw new ResourceNotFoundException('payroll benefit adjustment', id);
    }

    return payrollBenefitAdjustment;
  }

  // ==================== [Private block] ====================
  async validateAdjustmentType(id: number, employeeMovementId: number) {
    const adjustmentType: BenefitAdjustmentType =
      await this.adjustmentTypeRepo.findOneBy({ id });
    if (!adjustmentType) {
      throw new ResourceNotFoundException('adjustment type', id);
    } else if (
      adjustmentType.name === DefaultBenefitAdjustmentTypeEnum.MOVEMENT &&
      !employeeMovementId
    ) {
      throw new ResourceBadRequestException(
        'employeeMovementId',
        'Employee Movement must not be empty with adjustment type movement.'
      );
    } else if (
      adjustmentType.name !== DefaultBenefitAdjustmentTypeEnum.MOVEMENT &&
      employeeMovementId
    ) {
      throw new ResourceBadRequestException(
        'employeeMovementId',
        'Employee movement is not required with adjustment type not movement.'
      );
    }
  }

  async validateEmployeeMovementById(
    id: number,
    employeeId: number
  ): Promise<void> {
    if (!id) {
      return;
    }

    const employeeMovement: EmployeeMovement =
      await this.employeeMovementRepo.getEmployeeMovementWithNotFound(id);

    if (employeeMovement.employee.id !== employeeId) {
      throw new ResourceBadRequestException(
        'employeeMovementId',
        'Employee movement does not match with employee.'
      );
    }
  }

  async updatePayrollBenefitAdjustmentDetailStatus(
    payrollBenefitAdjustmentDetails: PayrollBenefitAdjustmentDetail[],
    queryRunner: QueryRunner
  ): Promise<void> {
    const payrollBenefitAdjustmentDetailData: PayrollBenefitAdjustmentDetail[] =
      [];

    payrollBenefitAdjustmentDetails.forEach(
      (payrollBenefitAdjustmentDetail: PayrollBenefitAdjustmentDetail) => {
        payrollBenefitAdjustmentDetailData.push(
          queryRunner.manager.create(PayrollBenefitAdjustmentDetail, {
            ...payrollBenefitAdjustmentDetail,
            status: AdjustmentDetailStatusEnum.ACTIVE
          })
        );
      }
    );

    await queryRunner.manager.save(payrollBenefitAdjustmentDetailData);
  }
}
