import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeColumnTypeInEmployeeTable1691375612345
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "employee" ALTER COLUMN "dob" TYPE DATE;
        ALTER TABLE "employee" ALTER COLUMN "start_date" TYPE DATE;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
