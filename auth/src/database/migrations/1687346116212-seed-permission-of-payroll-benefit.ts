import { MigrationInterface, QueryRunner } from 'typeorm';
import { PAYROLL_BENEFIT_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/payroll-benefit.enum';

export class SeedPermissionOfPayrollBenefit1687346116212
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'PAYROLL_BENEFIT', (SELECT id FROM "permission" WHERE name = 'PAYROLL_MODULE'));
        `);

    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('PAYROLL_MODULE,PAYROLL_BENEFIT')
            WHERE name = 'PAYROLL_BENEFIT';
        `);

    for (const data in PAYROLL_BENEFIT_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'PAYROLL_BENEFIT'));
        `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('PAYROLL_MODULE, PAYROLL_BENEFIT,${data}'))
            WHERE name = '${data}';
        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
