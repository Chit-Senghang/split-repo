import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  DataSource,
  ILike,
  Between,
  In,
  LessThanOrEqual,
  MoreThanOrEqual
} from 'typeorm';
import { ResourceConflictException } from '../../shared-resources/exception/conflict-resource.exception';
import { validateByStatusActive } from '../../shared-resources/utils/validate-by-status.utils';
import {
  duplicateLeave,
  duplicateOvertime,
  startTimeEndTimeError
} from '../constants/exception-message';
import { EmployeeProto } from '../../shared-resources/proto';
import { ResourceNotFoundException } from '../../shared-resources/exception/resource-not-found.exception';
import { removeUnnecessaryProps } from '../../shared-resources/function/remove-unnecessary-props';
import {
  checkIsValidYearFormat,
  customValidateTime,
  validateDateTime
} from '../../shared-resources/utils/validate-date-format';
import { Employee } from '../../employee/entity/employee.entity';
import { OvertimeRequest } from '../overtime-request/entities/overtime-request.entity';
import { EntityParam } from '../../shared-resources/ts/interface/entity-params';
import { RequestWorkFlowTypeEnum } from '../../request-workflow-type/common/ts/enum/request-workflow-type.enum';
import { UtilityService } from '../../utility/utility.service';
import { CreateApprovalStatusTrackingDto } from '../../approval-status-tracking/dto/create-approval-status-tracking.dto';
import { employeePositionRelation } from '../../../../auth/src/common/select-relation/custom-section-relation';
import { StatusEnum } from '../../shared-resources/common/enums/status.enum';
import { DEFAULT_DATE_FORMAT } from '../../shared-resources/common/dto/default-date-format';
import { ApprovalStatusTrackingValidationService } from '../../approval-status-tracking/approval-status-tracking-validation.service';
import { ApprovalStatusEnum } from '../../approval-status-tracking/common/ts/enum/approval-status.enum';
import { IEmployeeRepository } from '../../employee/repository/interface/employee.repository.interface';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { LeaveRequestRepository } from '../../leave/leave-request/repository/leave-request.repository';
import { ILeaveRequestRepository } from '../../leave/leave-request/repository/interface/leave-request-repository.interface';
import { MediaEntityTypeEnum } from '../../media/common/ts/enums/entity-type.enum';
import { EmployeeActiveStatusEnum } from '../../employee/enum/employee-status.enum';
import { CreateBorrowOrPaybackDto } from './dto/create-borrow-or-payback.dto';
import { UpdateBorrowOrPaybackDto } from './dto/update-borrow-or-payback.dto';
import { PaginationQueryBorrowOrPaybackDto } from './dto/pagination-borrow-or-payback.dto';
import {
  BorrowOrPaybackRequest,
  borrowPackBackSearchableColumns
} from './entities/borrow-or-payback.entity';
import { BorrowOrPayBackRequestRepository } from './repository/borrow-or-payback-request.repository';
import { IBorrowOrPayBackRequestRepository } from './repository/interface/borrow-or-payback-request.repository.interface';

interface borrowOrPaybackParams {
  id?: number;
  employeeId?: number;
}

@Injectable()
export class BorrowOrPaybackService {
  constructor(
    @Inject(BorrowOrPayBackRequestRepository)
    private readonly borrowOrPaybackRequestRepo: IBorrowOrPayBackRequestRepository,
    private readonly dataSource: DataSource,
    @Inject(LeaveRequestRepository)
    private readonly leaveRequestRepo: ILeaveRequestRepository,
    private readonly utilityService: UtilityService,
    private readonly approvalStatusValidationService: ApprovalStatusTrackingValidationService,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository
  ) {}

  validateAllAction = async (params: borrowOrPaybackParams) => {
    let borrowOrPayback: BorrowOrPaybackRequest;
    let employee: Employee;

    if (params.id) {
      borrowOrPayback = await this.borrowOrPaybackRequestRepo.findOne({
        where: {
          id: params.id,
          employee: { positions: { isDefaultPosition: true, isMoved: false } }
        },
        relations: {
          employee: {
            positions: {
              companyStructurePosition: {
                positionLevelId: true,
                companyStructureComponent: true
              },
              companyStructureTeam: {
                companyStructureComponent: true
              },
              companyStructureDepartment: {
                companyStructureComponent: true
              },
              companyStructureOutlet: {
                companyStructureComponent: true
              },
              companyStructureLocation: {
                companyStructureComponent: true
              }
            }
          }
        }
      });

      if (!borrowOrPayback) {
        throw new ResourceNotFoundException('borrow or payback', params.id);
      }
    }

    if (params.employeeId) {
      employee = await this.employeeRepo.getEmployeeByUserId(params.employeeId);
    }

    return params.id ? borrowOrPayback : employee;
  };

  async validateWithLeaveAndOvertime(
    createBorrowOrPaybackDto: CreateBorrowOrPaybackDto
  ) {
    if (createBorrowOrPaybackDto.startTime > createBorrowOrPaybackDto.endTime) {
      throw new ResourceConflictException(
        'startTime,endTime',
        startTimeEndTimeError
      );
    }

    const leave = await this.leaveRequestRepo.findOne({
      where: {
        employee: { id: createBorrowOrPaybackDto.employeeId },
        fromDate: LessThanOrEqual(createBorrowOrPaybackDto.requestDate),
        toDate: MoreThanOrEqual(createBorrowOrPaybackDto.requestDate)
      }
    });

    if (leave) {
      throw new ResourceConflictException('fromDate,toDate', duplicateLeave);
    }

    const overtimeRequest = await this.dataSource
      .getRepository(OvertimeRequest)
      .createQueryBuilder()
      .where(
        'employee_id = :employeeId AND request_date = :requestDate AND ((start_time BETWEEN :st AND :et) OR (end_time BETWEEN :st AND :et) OR (start_time < :st AND end_time > :et))',
        {
          employeeId: createBorrowOrPaybackDto.employeeId,
          requestDate: createBorrowOrPaybackDto.requestDate,
          st: createBorrowOrPaybackDto.startTime,
          et: createBorrowOrPaybackDto.endTime
        }
      )
      .getOne();

    if (overtimeRequest) {
      throw new ResourceConflictException('fromDate,toDate', duplicateOvertime);
    }
  }

  async create(createBorrowOrPaybackDto: CreateBorrowOrPaybackDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const employee = await this.employeeRepo.getEmployeeById(
        createBorrowOrPaybackDto.employeeId
      );
      createBorrowOrPaybackDto.paybackForRequestId &&
        (await this.validateAllAction({
          id: createBorrowOrPaybackDto.paybackForRequestId
        }));
      await this.validateWithLeaveAndOvertime(createBorrowOrPaybackDto);

      const isAdmin = await this.utilityService.checkIsAdmin();

      let result: any;
      if (!isAdmin) {
        result = await this.utilityService.validateWithWorkflow(
          employee,
          RequestWorkFlowTypeEnum.BORROW
        );
      }

      const borrowOrPayback = queryRunner.manager.create(
        BorrowOrPaybackRequest,
        {
          employee: { id: employee.id },
          requestDate: validateDateTime(createBorrowOrPaybackDto.requestDate),
          startTime: createBorrowOrPaybackDto.startTime,
          endTime: createBorrowOrPaybackDto.endTime,
          type: createBorrowOrPaybackDto.type,
          reason: createBorrowOrPaybackDto.reason,
          paybackForRequestId: {
            id: createBorrowOrPaybackDto.paybackForRequestId
          },
          status: isAdmin ? StatusEnum.ACTIVE : StatusEnum.PENDING
        }
      );
      const newBorrowOrPayback =
        await queryRunner.manager.save(borrowOrPayback);
      if (!isAdmin) {
        const approvalStatusDto: CreateApprovalStatusTrackingDto = {
          approvalWorkflowId: result.requestApprovalWorkflowId,
          requestWorkflowTypeId: result.workflowTypeId,
          entityId: newBorrowOrPayback.id,
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
      return newBorrowOrPayback;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      queryRunner.release();
    }
  }

  async findAll(pagination: PaginationQueryBorrowOrPaybackDto) {
    let startTime: string, endTime: string;
    if (pagination.startTime) {
      startTime = customValidateTime(pagination.startTime);
    }
    if (pagination.endTime) {
      endTime = customValidateTime(pagination.endTime);
    }
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

    return await this.borrowOrPaybackRequestRepo.findAllWithPagination(
      pagination,
      borrowPackBackSearchableColumns,
      {
        where: {
          employee: {
            id: In(employeeIds),
            status: In(Object.values(EmployeeActiveStatusEnum)),
            positions: {
              isDefaultPosition: true,
              isMoved: false,
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
          type: pagination.type,
          startTime: pagination.startTime ? MoreThanOrEqual(startTime) : null,
          endTime: pagination.endTime ? MoreThanOrEqual(endTime) : null,
          requestDate:
            pagination.fromDate && pagination.toDate
              ? Between(pagination.fromDate, pagination.toDate)
              : null,
          status: pagination.status
        },
        relation: {
          employee: {
            positions: employeePositionRelation
          },
          paybackForRequestId: true
        },
        select: {
          employee: {
            id: true,
            displayFullNameEn: true,
            accountNo: true,
            positions: {
              id: true,
              isMoved: false,
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
              companyStructureTeam: {
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
          paybackForRequestId: {
            id: true,
            requestDate: true,
            startTime: true,
            endTime: true
          }
        },
        mapFunction: (borrowOrPayback: BorrowOrPaybackRequest) => {
          if (borrowOrPayback.employee) {
            const employee = borrowOrPayback.employee;
            delete borrowOrPayback.employee;
            return {
              ...borrowOrPayback,
              employee: {
                id: employee.id,
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
                    .companyStructureComponent.name,
                mpath: employee.positions[0].mpath
              }
            };
          }
        }
      }
    );
  }

  async findOne(id: number) {
    const borrowOrPayback: any = await this.validateAllAction({ id });
    if (borrowOrPayback.employee) {
      const employee = borrowOrPayback.employee;
      delete borrowOrPayback.employee;
      const data = {
        ...borrowOrPayback,
        employee: {
          id: employee.id,
          displayFullNameEn: employee.displayFullNameEn,
          accountNo: employee.accountNo,
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
      removeUnnecessaryProps(data);
      return data;
    }
  }

  async update(id: number, updateBorrowOrPaybackDto: UpdateBorrowOrPaybackDto) {
    const borrowOrPayback: any = await this.validateAllAction({ id });
    validateByStatusActive(borrowOrPayback.status);

    // check if current user is creator or not.
    await this.utilityService.checkCurrentUserIsCreatorOrNot(
      borrowOrPayback.createdBy
    );

    const data = Object.assign(borrowOrPayback, {
      ...updateBorrowOrPaybackDto,
      requestDate: updateBorrowOrPaybackDto.requestDate
        ? validateDateTime(updateBorrowOrPaybackDto.requestDate)
        : borrowOrPayback.requestDate,
      employee: { id: updateBorrowOrPaybackDto.employeeId }
    });

    return await this.borrowOrPaybackRequestRepo.save(data);
  }

  async delete(id: number) {
    await this.approvalStatusValidationService.deleteEntityById(
      id,
      MediaEntityTypeEnum.BORROW
    );
  }

  async grpcUpdateStatus(request: EmployeeProto.EmployeeStatusParams) {
    const borrowOrPayback = await this.borrowOrPaybackRequestRepo.findOneBy({
      id: request.id
    });
    if (!borrowOrPayback) {
      throw new RpcException({
        message: `Resource borrow or payback of ${request.id} not found`,
        code: 5
      });
    }
    const result = await this.borrowOrPaybackRequestRepo.save(
      Object.assign(borrowOrPayback, { status: request.status })
    );
    return { employeeId: result.id };
  }

  async findOneByEntityId(requestDto: EntityParam) {
    const borrowOrPayback = await this.borrowOrPaybackRequestRepo.findOne({
      where: {
        id: requestDto.id,
        employee: {
          id: requestDto.employeeId || null,
          displayFullNameEn: requestDto.employeeName
            ? ILike(`%${requestDto.employeeName}%`)
            : null,
          positions: {
            isDefaultPosition: true,
            isMoved: false,
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
    if (!borrowOrPayback) {
      return null;
    }
    return {
      id: borrowOrPayback.id,
      firstNameEn: borrowOrPayback.employee.firstNameEn,
      lastNameEn: borrowOrPayback.employee.lastNameEn,
      phone: borrowOrPayback.employee.contacts[0].contact,
      email: borrowOrPayback.employee.email,
      location:
        borrowOrPayback.employee.positions[0].companyStructureLocation
          .companyStructureComponent.name,
      outlet:
        borrowOrPayback.employee.positions[0].companyStructureOutlet
          .companyStructureComponent.name,
      department:
        borrowOrPayback.employee.positions[0].companyStructureDepartment
          .companyStructureComponent.name,
      position:
        borrowOrPayback.employee.positions[0].companyStructurePosition
          .companyStructureComponent.name,
      displayFullNameEn: borrowOrPayback.employee.displayFullNameEn,
      employeeId: borrowOrPayback.employee ? borrowOrPayback.employee.id : null
    };
  }
}
