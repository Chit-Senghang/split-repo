import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteUnusedTables1684459278780 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "job_title";
        DROP TABLE IF EXISTS "pay_grade";
        DROP TABLE IF EXISTS "employee_status";
        DROP TABLE IF EXISTS "employee_qualification";
        DROP TABLE IF EXISTS "qualification";
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
