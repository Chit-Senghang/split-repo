import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEmployeeWorkflowAndMaterializedView1698042313389
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE employee_workflow;
        DROP MATERIALIZED VIEW IF EXISTS approval_status_view;
        DROP TRIGGER IF EXISTS refresh_approval_status ON approval_status;
        DROP FUNCTION IF EXISTS refresh_approval_status_view;
        DROP EXTENSION IF EXISTS dblink CASCADE;
        DROP SERVER IF EXISTS authentication CASCADE;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
