import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WorkflowTypeEnum } from '../shared-resources/common/enum/workflow-type.enum';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { RequestWorkFlowType } from './entities/request-workflow-type.entity';

@Injectable()
export class RequestWorkflowTypeValidationService {
  constructor(private readonly dataSource: DataSource) {}

  async findRequestWorkflowTypeByType(
    type: WorkflowTypeEnum
  ): Promise<RequestWorkFlowType> {
    const requestWorkflowType: RequestWorkFlowType = await this.dataSource
      .getRepository(RequestWorkFlowType)
      .findOne({
        where: {
          requestType: type
        }
      });

    if (!requestWorkflowType) {
      throw new ResourceNotFoundException(
        'request workflow type',
        `type ${requestWorkflowType}`
      );
    }

    return requestWorkflowType;
  }
}
