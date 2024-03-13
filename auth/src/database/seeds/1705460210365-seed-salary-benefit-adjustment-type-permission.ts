import { MigrationInterface, QueryRunner } from 'typeorm';
import { BenefitAdjustmentTypePermissionEnum } from '../../shared-resources/ts/enum/permission/employee/benefit-adjustment-type.enum';

export class SeedSalaryBenefitAdjustmentTypePermission1705460210365
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    for (const data in BenefitAdjustmentTypePermissionEnum) {
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
