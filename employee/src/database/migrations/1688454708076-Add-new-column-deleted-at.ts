import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnDeletedAt1688454708076 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "employee_post_probation_salary"
        ADD COLUMN "deleted_at" TIMESTAMP;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
