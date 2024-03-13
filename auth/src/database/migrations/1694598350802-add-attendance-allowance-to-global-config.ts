import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAttendanceAllowanceToGlobalConfig1694598350802
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO global_configuration (version, name, is_enable, value, type)
        VALUES (1, 'attendance-allowance', true, 25, 'PAYROLL');
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
