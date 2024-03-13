import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueEmailWithEmployeeTable1689672264922
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE employee ADD CONSTRAINT "uk_employee_email" UNIQUE ("email");   
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
