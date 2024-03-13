import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnToStoreCurrentEmployeeInfoToApprovalStatus1701314577188
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE approval_status
        ADD COLUMN employee_info VARCHAR NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
