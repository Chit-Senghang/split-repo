import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnEffectiveDateOnEmployeeResignation1699933446401
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "employee_resignation" ADD COLUMN "effective_date" DATE;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
