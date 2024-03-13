import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMpathColumnToEmployeePosition1685415668142
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "employee_position"
        ADD COLUMN "mpath" VARCHAR(50) NULL
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
