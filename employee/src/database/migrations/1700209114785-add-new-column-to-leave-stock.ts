import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnToLeaveStock1700209114785
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE leave_stock
        ADD COLUMN carry_forward_remaining DECIMAL NOT NULL DEFAULT(0)
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
