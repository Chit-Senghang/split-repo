import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnToLeaveStock1701683319397 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE leave_stock
        ADD COLUMN actual_carry_forward DECIMAL NOT NULL DEFAULT(0);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
