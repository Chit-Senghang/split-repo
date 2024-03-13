import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFlagToLeaveRequest1699339872249 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE leave_request
        ADD COLUMN is_special_leave BOOLEAN DEFAULT(false) NOT NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
