import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateColumnStatusOfEmployeeResignationAndMovementTo20Character1698741775267
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE employee_resignation
        ALTER COLUMN status TYPE VARCHAR(20);

        ALTER TABLE employee_movement
        ALTER COLUMN status TYPE VARCHAR(20);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
