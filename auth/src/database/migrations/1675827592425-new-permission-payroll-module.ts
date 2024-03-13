import { MigrationInterface, QueryRunner } from 'typeorm';

export class newPermissionPayrollModule1675827592425
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name")
            VALUES (2, 'PAYROLL_MODULE');
        `);
    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('PAYROLL_MODULE')
            WHERE name = 'PAYROLL_MODULE';
        `);
  }

  async down(): Promise<void> {
    return;
  }
}
