import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnToLeaveStock1700639626740
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE leave_stock
        ADD COLUMN leave_day_top_up_remaining DECIMAL NOT NULL DEFAULT(0);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
