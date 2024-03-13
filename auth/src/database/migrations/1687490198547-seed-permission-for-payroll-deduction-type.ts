import { MigrationInterface, QueryRunner } from 'typeorm';
import { PAYROLL_DEDUCTION_TYPE_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/payroll-deduction-type.enum';

export class SeedPermissionForPayrollDeductionType1687490198547
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'PAYROLL_DEDUCTION_TYPE', (SELECT id FROM "permission" WHERE name = 'META_DATA_MODULE'));
        `);

    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('META_DATA_MODULE,PAYROLL_DEDUCTION_TYPE')
            WHERE name = 'PAYROLL_DEDUCTION_TYPE';
        `);

    for (const data in PAYROLL_DEDUCTION_TYPE_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'PAYROLL_DEDUCTION_TYPE'));
        `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('META_DATA_MODULE, PAYROLL_DEDUCTION_TYPE,${data}'))
            WHERE name = '${data}';
        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
