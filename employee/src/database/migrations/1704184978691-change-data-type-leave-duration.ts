import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeDataTypeLeaveDuration1704184978691
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE leave_request
        ALTER COLUMN leave_duration TYPE DECIMAL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
