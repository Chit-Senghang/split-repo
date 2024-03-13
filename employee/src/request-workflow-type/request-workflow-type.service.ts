import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { WorkflowTypeEnum } from '../shared-resources/common/enum/workflow-type.enum';
import { RequestApprovalWorkflow } from '../request-approval-workflow/entities/request-approval-workflow.entity';
import { TypeEnum } from '../request-approval-workflow/common/ts/enum/type.enum';
import { AuthenticationProto } from '../shared-resources/proto';
import { RequestApprovalWorkflowLevel } from '../request-approval-workflow/entities/request-approval-workflow-level.entity';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { requestWorkFlowTypeConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { RequestWorkflowTypePaginationDto } from './dto/pagination-request-workflow-type.dto';
import { RequestWorkFlowType } from './entities/request-workflow-type.entity';
import { UpdateRequestWorkflowTypeDto } from './dto/update-request-workflow-type.dto';
import { RequestWorkFlowTypeEnum } from './common/ts/enum/request-workflow-type.enum';

@Injectable()
export class RequestWorkflowTypeService {
  private readonly REQUEST_WORK_FLOW_TYPE = 'request work flow type';

  constructor(
    @InjectRepository(RequestWorkFlowType)
    private readonly requestWorkflowTypeRepo: Repository<RequestWorkFlowType>
  ) {}

  async findAll(pagination: RequestWorkflowTypePaginationDto) {
    const data = await GetPagination(
      this.requestWorkflowTypeRepo,
      pagination,
      [],
      {
        select: {
          requestWorkflow: { id: true, enable: true, description: true }
        },
        relation: {
          requestWorkflow: {
            requestWorkflowLevel: {
              companyStructureDepartment: true,
              positionLevel: true
            }
          }
        },
        mapFunction: (workflowType: RequestWorkFlowType) => {
          return {
            id: workflowType.id,
            name: workflowType.requestType,
            description: workflowType.description,
            requestApprovalWorkflow: workflowType.requestWorkflow
          };
        }
      }
    );

    const result = await Promise.all(
      data.data.map(async (data: any) => {
        const workflow: any = await this.mapRequestApprovalWorkflow(
          data.requestApprovalWorkflow
        );
        return {
          ...data,
          requestApprovalWorkflow: workflow
        };
      })
    );
    return result;
  }

  mapRequestApprovalWorkflow = async (
    requestApprovalWorkflow: RequestApprovalWorkflow[]
  ) => {
    return await Promise.all(
      requestApprovalWorkflow.map(
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
    );
  };

  createResponseDtoForApprover = async (
    requestApprovalWorkflowLevel: RequestApprovalWorkflowLevel[],
    approverType: TypeEnum
  ) => {
    try {
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
                ? approver.companyStructureDepartment.id
                : null
            };
          })
      );
      return approver;
    } catch (exception) {
      handleResourceConflictException(exception, requestWorkFlowTypeConstraint);
    }
  };

  async update(
    id: number,
    updateRequestWorkflowTypeDto: UpdateRequestWorkflowTypeDto
  ) {
    try {
      const requestWorkFlowType = await this.requestWorkflowTypeRepo.findOne({
        where: {
          id
        }
      });
      if (!requestWorkFlowType) {
        throw new ResourceNotFoundException(this.REQUEST_WORK_FLOW_TYPE, id);
      }
      const trimInsuranceName = updateRequestWorkflowTypeDto.description.trim();
      return this.requestWorkflowTypeRepo.save(
        Object.assign(requestWorkFlowType, {
          description: trimInsuranceName
        })
      );
    } catch (exception) {
      handleResourceConflictException(exception, requestWorkFlowTypeConstraint);
    }
  }

  async FindOneByType(type: RequestWorkFlowTypeEnum) {
    const workflowType = await this.requestWorkflowTypeRepo.findOne({
      where: { requestType: type }
    });
    if (!workflowType) {
      throw new ResourceNotFoundException(
        `Resource request workflow type of ${type} not found`
      );
    }
    return workflowType;
  }

  async validateType(name: AuthenticationProto.workflowTypeName) {
    let type;
    switch (name.type) {
      case WorkflowTypeEnum.BORROW: {
        type = name.type;
        break;
      }
      case WorkflowTypeEnum.EMPLOYEE_INFO_UPDATE: {
        type = name.type;
        break;
      }
      case WorkflowTypeEnum.LEAVE_REQUEST: {
        type = name.type;
        break;
      }
      case WorkflowTypeEnum.MISSED_SCAN: {
        type = name.type;
        break;
      }
      case WorkflowTypeEnum.MISSION_REQUEST: {
        type = name.type;
        break;
      }
      case WorkflowTypeEnum.MOVEMENT: {
        type = name.type;
        break;
      }
      case WorkflowTypeEnum.OVERTIME_REQUEST: {
        type = name.type;
        break;
      }
      case WorkflowTypeEnum.PAYBACK_HOUR: {
        type = name.type;
        break;
      }
      case WorkflowTypeEnum.RESIGNATION_REQUEST: {
        type = name.type;
        break;
      }
      case WorkflowTypeEnum.SALARY_ADJUSTMENT: {
        type = name.type;
        break;
      }
      case WorkflowTypeEnum.WARNING: {
        type = name.type;
        break;
      }
      case WorkflowTypeEnum.DAY_OFF_REQUEST: {
        type = name.type;
        break;
      }
      case WorkflowTypeEnum.PAYROLL_BENEFIT_ADJUSTMENT: {
        type = name.type;
        break;
      }
      default:
        break;
    }
    return type;
  }
}
