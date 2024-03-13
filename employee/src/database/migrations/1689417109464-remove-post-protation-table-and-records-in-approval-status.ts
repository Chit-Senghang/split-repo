import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePostProtationTableAndRecordsInApprovalStatus1689417109464
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM notification
        WHERE approval_status_id = (SELECT id FROM approval_status WHERE request_workflow_type_id = (SELECT id FROM request_work_flow_type WHERE request_type = 'PAYROLL_POST_PROBATION'));
    `);

    await queryRunner.query(`
        DELETE FROM approval_status
        WHERE request_workflow_type_id = (SELECT id FROM request_work_flow_type WHERE request_type = 'PAYROLL_POST_PROBATION');
    `);

    await queryRunner.query(`
        DELETE FROM employee_post_probation_salary;
        DROP TABLE employee_post_probation_salary;
    `);

    await queryRunner.query(`
        DELETE FROM request_work_flow_type
        WHERE request_type = 'PAYROLL_POST_PROBATION';
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
