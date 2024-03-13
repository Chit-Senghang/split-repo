import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterLeaveRequest1688971902902 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE leave_request 
        ADD COLUMN leave_duration DECIMAL(4,2);
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
