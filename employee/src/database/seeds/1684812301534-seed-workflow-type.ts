import { MigrationInterface, QueryRunner } from 'typeorm';
import { RequestWorkFlowTypeEnum } from '../../request-workflow-type/common/ts/enum/request-workflow-type.enum';

const seedData = [
  {
    version: 1,
    requestType: RequestWorkFlowTypeEnum.LEAVE_REQUEST,
    description: 'leave request'
  },
  {
    version: 1,
    requestType: RequestWorkFlowTypeEnum.MISSION_REQUEST,
    description: 'mission request'
  },
  {
    version: 1,
    requestType: RequestWorkFlowTypeEnum.OVERTIME_REQUEST,
    description: 'overtime request'
  },
  {
    version: 1,
    requestType: RequestWorkFlowTypeEnum.BORROW,
    description: 'borrow'
  },
  {
    version: 1,
    requestType: RequestWorkFlowTypeEnum.PAYBACK_HOUR,
    description: 'payback hour'
  },
  {
    version: 1,
    requestType: RequestWorkFlowTypeEnum.MISSED_SCAN,
    description: 'missed scan'
  },
  {
    version: 1,
    requestType: RequestWorkFlowTypeEnum.RESIGNATION_REQUEST,
    description: 'resignation request'
  },
  {
    version: 1,
    requestType: RequestWorkFlowTypeEnum.MOVEMENT,
    description: 'movement'
  },
  {
    version: 1,
    requestType: RequestWorkFlowTypeEnum.SALARY_ADJUSTMENT,
    description: 'salary adjustment'
  },
  {
    version: 1,
    requestType: RequestWorkFlowTypeEnum.EMPLOYEE_INFO_UPDATE,
    description: 'employee info update'
  },
  {
    version: 1,
    requestType: RequestWorkFlowTypeEnum.WARNING,
    description: 'warning'
  }
] as const;
export class SeedWorkflowType1684812301534 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    for (const data of seedData) {
      await queryRunner.query(`
      INSERT INTO "request_work_flow_type" (version, "request_type", "description")
      VALUES('${data.version}', '${data.requestType}', '${data.description}')
      `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
