// import {} from 'apps/employee/src/payroll-cycle-configuration/entities/payroll-cycle-configuration.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { PayrollCycleConfigurationPermissionEnum } from '../../shared-resources/ts/enum/permission/employee/payroll-cycle-configuration.enum';

export class SeedPayrollCycleConfigurationPermission1704783583513
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    for (const data in PayrollCycleConfigurationPermissionEnum) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'PAYROLL_MANAGEMENT'));
        `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('META_DATA_MODULE,PAYROLL_MANAGEMENT,${data}'))
            WHERE name = '${data}';
        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
