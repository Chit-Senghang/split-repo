import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamePassProbationColumn1691976792483
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE employee
        RENAME is_passed_probation TO pass_probation_status;
        ALTER TABLE employee
        ALTER COLUMN pass_probation_status TYPE VARCHAR(20);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
