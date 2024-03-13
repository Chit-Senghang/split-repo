import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAttendanceRuleToGlobalConfig1694079457886
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        INSERT INTO global_configuration (version, name, is_enable, is_system_defined, value, type, description)
        VALUES 
        (1, 'allow-before-and-after-start-scan-duration', true, true, 30, 'ATTENDANCE', 'value in minute to get the boundary of check in and identify before/after OT'), 
        (1, 'allow-before-and-after-end-scan-duration', true, true, 30, 'ATTENDANCE', 'value in minute to get the boundary of check out and identify before/after OT'),
        (1, 'allow-check-out-early', true, true, 5, 'ATTENDANCE', 'value in minute to verify employee absent or normal');
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
