import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnToApprovalStatus1696869039657
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE approval_status
        ADD COLUMN request_change_original_json VARCHAR NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
