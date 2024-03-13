import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWorkflowType1682688411452 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            UPDATE request_work_flow_type set request_type = 'BORROW/PAYBACK_HOUR' WHERE request_type = 'BORROW';
            DELETE FROM request_work_flow_type WHERE request_type = 'PAYBACK_HOUR';
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
