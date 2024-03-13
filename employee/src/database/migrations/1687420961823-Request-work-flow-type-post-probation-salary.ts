import { MigrationInterface, QueryRunner } from 'typeorm';

export class RequestWorkFlowTypePostProbationSalary1687420961823
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    INSERT INTO "request_work_flow_type" (version, "request_type", "description")
    VALUES(0, 'PAYROLL_POST_PROBATION', 'payroll post probation');
`);
  }

  async down(): Promise<void> {
    return;
  }
}
