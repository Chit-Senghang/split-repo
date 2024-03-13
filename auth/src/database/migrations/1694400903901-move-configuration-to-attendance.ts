import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveConfigurationToAttendance1694400903901
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    UPDATE global_configuration 
    SET "type" = 'ATTENDANCE'
    WHERE name IN ('allow-miss-scan-time');
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
