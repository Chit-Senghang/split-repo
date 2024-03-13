import { MigrationInterface, QueryRunner } from 'typeorm';
import { PAYROLL_DEDUCTION_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/payroll-deduction.enum';

export class SeedPayrollDeduction1687591222971 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
                VALUES(2, 'PAYROLL_DEDUCTION', (SELECT id FROM "permission" WHERE name = 'PAYROLL_MODULE'));
            `);

    await queryRunner.query(`
                UPDATE
                "permission"
                SET
                mpath = get_permission_mpath('PAYROLL_MODULE,PAYROLL_DEDUCTION')
                WHERE name = 'PAYROLL_DEDUCTION';
            `);

    for (const data in PAYROLL_DEDUCTION_PERMISSION) {
      await queryRunner.query(`
                INSERT INTO "permission" (version, "name",parent_id)
                VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'PAYROLL_DEDUCTION'));
            `);
      await queryRunner.query(`
                UPDATE
                "permission"
                SET
                mpath = (get_permission_mpath('PAYROLL_MODULE, PAYROLL_DEDUCTION,${data}'))
                WHERE name = '${data}';
            `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
