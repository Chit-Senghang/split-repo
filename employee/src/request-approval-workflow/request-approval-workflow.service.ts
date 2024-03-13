import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
import { ResourceConflictException } from '../shared-resources/exception/conflict-resource.exception';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { PositionLevel } from '../position-level/entities/position-level.entity';
import { CompanyStructure } from '../company-structure/entities/company-structure.entity';
import { CompanyStructureTypeEnum } from '../company-structure/common/ts/enum/structure-type.enum';
import { RequestWorkFlowType } from '../request-workflow-type/entities/request-workflow-type.entity';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { getCurrentUserFromContext } from '../shared-resources/utils/get-user-from-current-context.common';
import { Employee } from '../employee/entity/employee.entity';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { IEmployeeRepository } from '../employee/repository/interface/employee.repository.interface';
import { CreateRequestApprovalWorkflowDto } from './dto/create-request-approval-workflow.dto';
import { TypeEnum } from './common/ts/enum/type.enum';
import { CreateRequestApprovalWorkflowLevelDto } from './dto/create-request-approval-workflow-level.dto';
import { RequestApprovalWorkflowLevel } from './entities/request-approval-workflow-level.entity';
import { RequestApprovalWorkflow } from './entities/request-approval-workflow.entity';
import { handleConflictExceptionRequestApprovalWorkflow } from './common/function/handle-conflict-exception-request-approval-workflow';
import { REQUESTER_ERROR_MESSAGE } from './constant/error-message-for-workflow';

@Injectable()
export class RequestApprovalWorkflowService {
  private readonly REQUEST_WORKFLOW_TYPE = 'Request Workflow Type';

  private readonly REQUEST_APPROVAL_WORKFLOW = 'Request Approval Workflow';

  constructor(
    @InjectRepository(RequestApprovalWorkflow)
    private readonly requestApprovalWorkflowRepo: Repository<RequestApprovalWorkflow>,
    @InjectRepository(RequestWorkFlowType)
    private readonly requestWorkflowTypeRepo: Repository<RequestWorkFlowType>,
    @InjectRepository(PositionLevel)
    private readonly positionLevelRepo: Repository<PositionLevel>,
    private readonly dataSource: DataSource,
    @InjectRepository(CompanyStructure)
    private readonly companyStructureRepo: Repository<CompanyStructure>,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository
  ) {}

  validateCompanyStructureDepartment = async (id: number, teamId: number) => {
    const companyStructureDepartment = await this.companyStructureRepo.findOne({
      where: {
        id,
        companyStructureComponent: { type: CompanyStructureTypeEnum.DEPARTMENT }
      },
      relations: {
        companyStructureComponent: true,
        parentId: { companyStructureComponent: true }
      }
    });

    if (!companyStructureDepartment) {
      throw new ResourceNotFoundException('company structure department', id);
    }

    if (!companyStructureDepartment.parentId.isHq) {
      throw new ResourceNotFoundException(
        'You can only create workflow with cross department of headquarter'
      );
    }

    if (!teamId) {
      throw new ResourceNotFoundException(
        `companyStructureTeamId should not be empty`
      );
    }

    const team = await this.companyStructureRepo.findOne({
      where: {
        id: teamId,
        companyStructureComponent: { type: CompanyStructureTypeEnum.TEAM }
      }
    });

    if (!team) {
      throw new ResourceNotFoundException('company structure team', id);
    }

    return companyStructureDepartment;
  };

  validatePositionLevel = async (id: number) => {
    const positionLevel = await this.positionLevelRepo.findOneBy({ id });
    if (!positionLevel) {
      throw new ResourceNotFoundException('position level', id);
    }
    return positionLevel;
  };

  validateDuplicateWorkflowLevel = async (
    queryRunner: QueryRunner,
    workflowTypeId: number,
    createRequestApprovalWorkflowDto: CreateRequestApprovalWorkflowDto
  ) => {
    // case have both requesters and requestFors
    let requestWorkflow: RequestApprovalWorkflow[];
    let duplicatePositionsLevel: number;

    const hasRequesters: number =
      createRequestApprovalWorkflowDto.requesters.length;
    const hasRequestFors: number =
      createRequestApprovalWorkflowDto.requestFors.length;

    if (hasRequesters && hasRequestFors) {
      requestWorkflow = await queryRunner.manager.find(
        RequestApprovalWorkflow,
        {
          where: {
            requestWorkflowType: {
              id: workflowTypeId
            },
            requestWorkflowLevel: {
              type: TypeEnum.REQUEST_FORS,
              positionLevel: In(
                createRequestApprovalWorkflowDto.requestFors.map(
                  (
                    createRequestApprovalWorkflowDto: CreateRequestApprovalWorkflowLevelDto
                  ) => {
                    duplicatePositionsLevel =
                      createRequestApprovalWorkflowDto.positionLevelId;

                    return createRequestApprovalWorkflowDto.positionLevelId;
                  }
                )
              )
            }
          },
          relations: {
            requestWorkflowLevel: true
          }
        }
      );
    } else {
      requestWorkflow = await queryRunner.manager.find(
        RequestApprovalWorkflow,
        {
          where: {
            requestWorkflowType: {
              id: workflowTypeId
            },
            requestWorkflowLevel: {
              type: TypeEnum.REQUESTERS,
              positionLevel: In(
                createRequestApprovalWorkflowDto.requesters.map(
                  (
                    createRequestApprovalWorkflowDto: CreateRequestApprovalWorkflowLevelDto
                  ) => {
                    duplicatePositionsLevel =
                      createRequestApprovalWorkflowDto.positionLevelId;
                    return createRequestApprovalWorkflowDto.positionLevelId;
                  }
                )
              )
            }
          },
          relations: {
            requestWorkflowLevel: true
          }
        }
      );
    }

    // path from conflict exception
    const path = handleConflictExceptionRequestApprovalWorkflow(
      createRequestApprovalWorkflowDto,
      `positionLevelId`,
      duplicatePositionsLevel
    );

    if (requestWorkflow.length > 0) {
      // duplicate positionLevelId
      throw new ResourceConflictException(path);
    }
  };

  async createOrUpdateWorkflow(
    existingRequestApprovalWorkflow: RequestApprovalWorkflow,
    workflowTypeId: number,
    createRequestApprovalWorkflowDto: CreateRequestApprovalWorkflowDto
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const workflowType = await this.requestWorkflowTypeRepo.findOne({
        where: { id: workflowTypeId }
      });
      if (!workflowType) {
        throw new ResourceNotFoundException(
          this.REQUEST_WORKFLOW_TYPE,
          workflowTypeId
        );
      }

      let requestWorkflow: RequestApprovalWorkflow;

      if (existingRequestApprovalWorkflow) {
        if (createRequestApprovalWorkflowDto.description) {
          await queryRunner.manager.save(
            Object.assign(existingRequestApprovalWorkflow, {
              description: createRequestApprovalWorkflowDto.description
            })
          );
        }

        requestWorkflow = existingRequestApprovalWorkflow;

        await queryRunner.manager.delete(RequestApprovalWorkflowLevel, {
          requestApprovalWorkflow: { id: existingRequestApprovalWorkflow.id }
        });

        await this.validateDuplicateWorkflowLevel(
          queryRunner,
          existingRequestApprovalWorkflow.requestWorkflowType.id,
          createRequestApprovalWorkflowDto
        );
      } else {
        await this.validateDuplicateWorkflowLevel(
          queryRunner,
          workflowTypeId,
          createRequestApprovalWorkflowDto
        );
        const requestWorkflowData = queryRunner.manager.create(
          RequestApprovalWorkflow,
          {
            enable: createRequestApprovalWorkflowDto.enable,
            description: createRequestApprovalWorkflowDto.description,
            requestWorkflowType: {
              id: workflowType.id
            }
          }
        );

        requestWorkflow = await queryRunner.manager.save(requestWorkflowData);
      }

      //* Insert records of requesters
      for (const requester of createRequestApprovalWorkflowDto.requesters) {
        await this.validatePositionLevel(requester.positionLevelId);

        if (requester.companyStructureDepartmentId) {
          await this.validateCompanyStructureDepartment(
            requester.companyStructureDepartmentId,
            requester.companyStructureTeamId
          );
        }

        const workflowLevel = queryRunner.manager.create(
          RequestApprovalWorkflowLevel,
          {
            positionLevel: { id: requester.positionLevelId },
            requestApprovalWorkflow: { id: requestWorkflow.id },
            companyStructureDepartment: {
              id: requester.companyStructureDepartmentId
            },
            companyStructureTeam: {
              id: requester.companyStructureTeamId
            },
            type: TypeEnum.REQUESTERS
          }
        );
        await queryRunner.manager.save(workflowLevel);
      }
      //* Insert records of firstApprovers
      for (const firstApprover of createRequestApprovalWorkflowDto.firstApprovers) {
        await this.validatePositionLevel(firstApprover.positionLevelId);
        if (firstApprover.companyStructureDepartmentId) {
          await this.validateCompanyStructureDepartment(
            firstApprover.companyStructureDepartmentId,
            firstApprover.companyStructureTeamId
          );
        }
        const workflowLevel = queryRunner.manager.create(
          RequestApprovalWorkflowLevel,
          {
            positionLevel: { id: firstApprover.positionLevelId },
            requestApprovalWorkflow: { id: requestWorkflow.id },
            companyStructureDepartment: {
              id: firstApprover.companyStructureDepartmentId
            },
            companyStructureTeam: {
              id: firstApprover.companyStructureTeamId
            },
            type: TypeEnum.FIRST_APPROVALS
          }
        );
        await queryRunner.manager.save(workflowLevel);
      }

      //*Insert records of RequestFors
      for (const requestFor of createRequestApprovalWorkflowDto.requestFors) {
        await this.validatePositionLevel(requestFor.positionLevelId);
        if (requestFor.companyStructureDepartmentId) {
          await this.validateCompanyStructureDepartment(
            requestFor.companyStructureDepartmentId,
            requestFor.companyStructureTeamId
          );
        }
        const workflowLevel = queryRunner.manager.create(
          RequestApprovalWorkflowLevel,
          {
            positionLevel: { id: requestFor.positionLevelId },
            requestApprovalWorkflow: { id: requestWorkflow.id },
            companyStructureDepartment: {
              id: requestFor.companyStructureDepartmentId
            },
            companyStructureTeam: {
              id: requestFor.companyStructureTeamId
            },
            type: TypeEnum.REQUEST_FORS
          }
        );
        await queryRunner.manager.save(workflowLevel);
      }

      //*Insert records of Second Approvers
      for (const secondApprover of createRequestApprovalWorkflowDto.secondApprovers) {
        await this.validatePositionLevel(secondApprover.positionLevelId);

        if (secondApprover.companyStructureDepartmentId) {
          await this.validateCompanyStructureDepartment(
            secondApprover.companyStructureDepartmentId,
            secondApprover.companyStructureTeamId
          );
        }
        const workflowLevel = queryRunner.manager.create(
          RequestApprovalWorkflowLevel,
          {
            positionLevel: { id: secondApprover.positionLevelId },
            requestApprovalWorkflow: { id: requestWorkflow.id },
            companyStructureDepartment: {
              id: secondApprover.companyStructureDepartmentId
            },
            companyStructureTeam: {
              id: secondApprover.companyStructureTeamId
            },
            type: TypeEnum.SECOND_APPROVALS
          }
        );
        await queryRunner.manager.save(workflowLevel);
      }
      //*Insert records of Acknowledgers
      for (const acknowledger of createRequestApprovalWorkflowDto.acknowledgers) {
        await this.validatePositionLevel(acknowledger.positionLevelId);
        if (acknowledger.companyStructureDepartmentId) {
          await this.validateCompanyStructureDepartment(
            acknowledger.companyStructureDepartmentId,
            acknowledger.companyStructureTeamId
          );
        }
        const workflowLevel = queryRunner.manager.create(
          RequestApprovalWorkflowLevel,
          {
            positionLevel: { id: acknowledger.positionLevelId },
            requestApprovalWorkflow: { id: requestWorkflow.id },
            companyStructureDepartment: {
              id: acknowledger.companyStructureDepartmentId
            },
            companyStructureTeam: {
              id: acknowledger.companyStructureTeamId
            },
            type: TypeEnum.ACKNOWLEDGERS
          }
        );
        await queryRunner.manager.save(workflowLevel);
      }
      await queryRunner.commitTransaction();
      return requestWorkflow;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      throw exception;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number) {
    const workflowType: RequestWorkFlowType =
      await this.requestWorkflowTypeRepo.findOne({
        where: { id },
        relations: {
          requestWorkflow: {
            requestWorkflowLevel: {
              companyStructureDepartment: { companyStructureComponent: true },
              companyStructureTeam: { companyStructureComponent: true },
              positionLevel: true
            }
          }
        }
      });
    if (!workflowType) {
      throw new ResourceNotFoundException(this.REQUEST_WORKFLOW_TYPE, id);
    }
    const data = {
      id: workflowType.id,
      name: workflowType.requestType,
      description: workflowType.description,
      requestApprovalWorkflow: workflowType.requestWorkflow
        ? await Promise.all(
            workflowType.requestWorkflow.map(
              async (requestWorkflow: RequestApprovalWorkflow) => {
                const { id, enable, description } = requestWorkflow;
                return {
                  id,
                  enable,
                  description,
                  requesters: requestWorkflow.requestWorkflowLevel
                    ? await Promise.all(
                        await this.createResponseDtoForApprover(
                          requestWorkflow.requestWorkflowLevel,
                          TypeEnum.REQUESTERS
                        )
                      )
                    : null,
                  requestFors: requestWorkflow.requestWorkflowLevel
                    ? await Promise.all(
                        await this.createResponseDtoForApprover(
                          requestWorkflow.requestWorkflowLevel,
                          TypeEnum.REQUEST_FORS
                        )
                      )
                    : null,
                  firstApprovers: requestWorkflow.requestWorkflowLevel
                    ? await Promise.all(
                        await this.createResponseDtoForApprover(
                          requestWorkflow.requestWorkflowLevel,
                          TypeEnum.FIRST_APPROVALS
                        )
                      )
                    : null,
                  secondApprovers: requestWorkflow.requestWorkflowLevel
                    ? await Promise.all(
                        await this.createResponseDtoForApprover(
                          requestWorkflow.requestWorkflowLevel,
                          TypeEnum.SECOND_APPROVALS
                        )
                      )
                    : null,
                  acknowledgers: requestWorkflow.requestWorkflowLevel
                    ? await Promise.all(
                        await this.createResponseDtoForApprover(
                          requestWorkflow.requestWorkflowLevel,
                          TypeEnum.ACKNOWLEDGERS
                        )
                      )
                    : null
                };
              }
            )
          )
        : null
    };
    return data;
  }

  createResponseDtoForApprover = async (
    requestApprovalWorkflowLevel: RequestApprovalWorkflowLevel[],
    approverType: TypeEnum
  ) => {
    const approver = Promise.all(
      requestApprovalWorkflowLevel
        .filter(
          (approver: RequestApprovalWorkflowLevel) =>
            approver.type === approverType
        )
        .map(async (approver: RequestApprovalWorkflowLevel) => {
          return {
            id: approver.id,
            positionLevel: approver.positionLevel,
            companyStructureDepartment: approver.companyStructureDepartment
              ? {
                  id: approver.companyStructureDepartment.id,
                  name: approver.companyStructureDepartment
                    .companyStructureComponent.name,
                  type: approver.companyStructureDepartment
                    .companyStructureComponent.type
                }
              : null,
            companyStructureTeam: approver.companyStructureTeam
              ? {
                  id: approver.companyStructureTeam.id,
                  name: approver.companyStructureTeam.companyStructureComponent
                    .name,
                  type: approver.companyStructureTeam.companyStructureComponent
                    .type
                }
              : null
          };
        })
    );
    return approver;
  };

  async update(
    requestWorkflowId: number,
    createRequestApprovalWorkflowDto: CreateRequestApprovalWorkflowDto
  ) {
    const requestWorkflow: RequestApprovalWorkflow =
      await this.requestApprovalWorkflowRepo.findOne({
        where: { id: requestWorkflowId },
        relations: {
          requestWorkflowType: true,
          requestWorkflowLevel: true
        }
      });
    if (!requestWorkflow) {
      throw new ResourceNotFoundException(
        this.REQUEST_APPROVAL_WORKFLOW,
        requestWorkflowId
      );
    }
    return await this.createOrUpdateWorkflow(
      requestWorkflow,
      null,
      createRequestApprovalWorkflowDto
    );
  }

  async enableWorkflow(id: number, enable: boolean) {
    const requestWorkflow = await this.requestApprovalWorkflowRepo.findOneBy({
      id
    });
    if (!requestWorkflow) {
      throw new ResourceNotFoundException(this.REQUEST_APPROVAL_WORKFLOW, id);
    }
    return await this.requestApprovalWorkflowRepo.save(
      Object.assign(requestWorkflow, enable)
    );
  }

  async deleteWorkflow(workflowId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(RequestApprovalWorkflowLevel, {
        requestApprovalWorkflow: {
          id: workflowId
        }
      });

      await queryRunner.manager.delete(RequestApprovalWorkflow, {
        id: workflowId
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getRequestApprovalWorkflowByWorkflowType(
    requestWorkflowType: RequestWorkFlowType,
    employee: Employee
  ): Promise<{
    requestWorkflow: RequestApprovalWorkflow;
    requesterPosition: EmployeePosition;
  }> {
    const workflows: RequestApprovalWorkflow[] =
      await this.getApprovalWorkflowByWorkflowTypeId(requestWorkflowType);

    let requesterPosition: EmployeePosition;
    let requestForPosition: EmployeePosition;
    let isContainRequestFor: RequestApprovalWorkflowLevel;

    //CHECK: if requester and request for is the same employee
    const { isRequesterAndRequestFor, currentEmployee } =
      await this.isSameRequesterAndRequestFor(employee.id);

    for (const requestApprovalWorkflow of workflows) {
      isContainRequestFor = this.isWorkflowContainRequestFor(
        requestApprovalWorkflow
      );
      //GET: requester position matching workflow
      requesterPosition = await this.getMatchedWorkflowLevel(
        requestApprovalWorkflow,
        currentEmployee,
        TypeEnum.REQUESTERS
      );

      if (isRequesterAndRequestFor) {
        //GET: request for position matching workflow
        requestForPosition = await this.getMatchedWorkflowLevel(
          requestApprovalWorkflow,
          employee,
          TypeEnum.REQUEST_FORS
        );

        //VALIDATE: position and team of requester and request for
        if (requesterPosition && requestForPosition) {
          await this.validateRequesterAndRequestFor(
            requesterPosition,
            requestForPosition
          );

          return {
            requestWorkflow: requestApprovalWorkflow,
            requesterPosition
          };
        }
      }

      if (
        requesterPosition &&
        !isRequesterAndRequestFor &&
        !isContainRequestFor
      ) {
        return {
          requestWorkflow: requestApprovalWorkflow,
          requesterPosition
        };
      }
    }

    //THROW: error message when not matching workflow
    this.handleErrorMessageWhenNotInWorkflow(
      isRequesterAndRequestFor,
      isContainRequestFor,
      requestForPosition,
      requesterPosition
    );
  }

  handleErrorMessageWhenNotInWorkflow(
    isSameRequesterAndRequestFor: boolean,
    containRequestFor: RequestApprovalWorkflowLevel,
    requestForPosition: EmployeePosition,
    requesterPosition: EmployeePosition
  ): void {
    if (isSameRequesterAndRequestFor && !requestForPosition) {
      throw new ResourceNotFoundException(
        `RequestFor's position doesn't match with workflow`
      );
    }

    if (containRequestFor && !requestForPosition) {
      throw new ResourceNotFoundException('No workflow match with requester.');
    }

    if (!requesterPosition) {
      throw new ResourceNotFoundException(REQUESTER_ERROR_MESSAGE);
    }
  }

  // ==================== [Private block functions] ====================

  private isWorkflowContainRequestFor(
    requestApprovalWorkflow: RequestApprovalWorkflow
  ): RequestApprovalWorkflowLevel {
    return requestApprovalWorkflow.requestWorkflowLevel.find(
      (requestWorkflowLevel: RequestApprovalWorkflowLevel) =>
        requestWorkflowLevel.type === TypeEnum.REQUEST_FORS
    );
  }

  private async getApprovalWorkflowByWorkflowTypeId(
    requestWorkflowType: RequestWorkFlowType
  ): Promise<RequestApprovalWorkflow[]> {
    const workflow = await this.requestApprovalWorkflowRepo.find({
      where: { requestWorkflowType: { id: requestWorkflowType.id } },
      relations: {
        requestWorkflowLevel: {
          companyStructureDepartment: true,
          positionLevel: true,
          companyStructureTeam: true
        }
      }
    });

    if (!workflow.length) {
      throw new ResourceNotFoundException(
        `Request approval workflow ${requestWorkflowType.requestType} not found`
      );
    }

    return workflow;
  }

  private async getCurrentEmployee() {
    const userId: number = getCurrentUserFromContext();
    return await this.employeeRepo.getEmployeeByUserId(userId);
  }

  private async checkRequesterTeams(
    teamId: number,
    companyStructureTeamIds: number[]
  ): Promise<number[]> {
    if (!teamId) {
      return companyStructureTeamIds;
    }

    const companyStructure: CompanyStructure =
      await this.companyStructureRepo.findOne({
        where: { id: teamId },
        relations: {
          companyStructureComponent: true,
          parentId: { companyStructureComponent: true }
        },
        select: {
          id: true,
          companyStructureComponent: { id: true, name: true, type: true },
          parentId: {
            id: true,
            companyStructureComponent: { id: true, name: true, type: true }
          }
        }
      });

    companyStructureTeamIds.push(teamId);

    if (companyStructure) {
      const isCompanyStructureTeam: boolean =
        companyStructure.parentId.companyStructureComponent.type ===
        CompanyStructureTypeEnum.TEAM;

      if (isCompanyStructureTeam) {
        await this.checkRequesterTeams(
          companyStructure.parentId.id,
          companyStructureTeamIds
        );
      }
    }

    return companyStructureTeamIds;
  }

  private async validateRequesterAndRequestFor(
    requesterPosition: EmployeePosition,
    requestForPosition: EmployeePosition
  ): Promise<PositionLevel> {
    //VALIDATE: requester and request for team
    await this.validateRequesterAndRequestForTeam(
      requesterPosition,
      requestForPosition
    );

    //VALIDATE: requester and request for position level number
    await this.validateRequesterAndRequestForPosition(
      requesterPosition,
      requestForPosition
    );

    return requesterPosition.companyStructurePosition.positionLevelId;
  }

  private async validateRequesterAndRequestForPosition(
    requesterPosition: EmployeePosition,
    requestForPosition: EmployeePosition
  ) {
    const requesterLevelNumber = String(
      requesterPosition?.companyStructurePosition?.positionLevelId?.levelNumber
    );
    const requestForLevelNumber = String(
      requestForPosition?.companyStructurePosition?.positionLevelId?.levelNumber
    );

    const isHigherLevel = this.checkRequesterLevelNumber(
      requesterLevelNumber,
      requestForLevelNumber
    );

    if (!isHigherLevel) {
      throw new ResourceForbiddenException(
        `Not able to create record because your position is lower than who you are requesting for.`
      );
    }
  }

  private async validateRequesterAndRequestForTeam(
    requesterPosition: EmployeePosition,
    requestForPosition: EmployeePosition
  ) {
    const teamIds: number[] = [];
    await this.checkRequesterTeams(
      requestForPosition.companyStructureTeam.id,
      teamIds
    );

    if (!teamIds.includes(requesterPosition.companyStructureTeam.id)) {
      throw new ResourceForbiddenException(
        `Not able to create record, due to you are in different division.`
      );
    }
  }

  private checkRequesterLevelNumber = (
    requesterPositionLevelNumber: string,
    requestForPositionLevelNumber: string
  ): boolean => {
    return (
      Number(requesterPositionLevelNumber) >
      Number(requestForPositionLevelNumber)
    );
  };

  private async isSameRequesterAndRequestFor(
    employeeId: number
  ): Promise<{ isRequesterAndRequestFor: boolean; currentEmployee: Employee }> {
    const currentEmployee: Employee = await this.getCurrentEmployee();
    return {
      isRequesterAndRequestFor: employeeId !== currentEmployee.id,
      currentEmployee
    };
  }

  private async getMatchedWorkflowLevel(
    workflow: RequestApprovalWorkflow,
    employee: Employee,
    requestType: TypeEnum
  ): Promise<EmployeePosition> {
    return employee.positions.find((position: EmployeePosition) =>
      workflow.requestWorkflowLevel.find(
        (item: RequestApprovalWorkflowLevel) =>
          item.positionLevel.id ===
            position.companyStructurePosition.positionLevelId.id &&
          item.type === requestType
      )
    );
  }
}
