import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsSystemDefinedToTrueWorkingshiftType1688378630953
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE workshift_type
        SET is_system_defined = true
        WHERE name = 'ROSTER' OR name = 'NORMAL';
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
