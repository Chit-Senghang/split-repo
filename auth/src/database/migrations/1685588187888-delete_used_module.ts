import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteUsedModule1685588187888 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            DROP TABLE media;
            DROP TABLE approval_status;
            DROP TABLE request_approval_workflow_level;
            DROP TABLE request_approval_workflow;
            DROP TABLE request_work_flow_type;
            DROP TABLE reason_template;

        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
