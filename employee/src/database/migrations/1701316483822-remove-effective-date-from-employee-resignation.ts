import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEffectiveDateFromEmployeeResignation1701316483822
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_resignation" DROP COLUMN "effective_date"`
    );
  }

  async down(): Promise<void> {
    return;
  }
}
