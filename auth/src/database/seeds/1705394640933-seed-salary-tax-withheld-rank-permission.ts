import { MigrationInterface, QueryRunner } from 'typeorm';
import { SalaryTaxWithheldRankPermission } from '../../shared-resources/ts/enum/permission/employee/salay-tax-withheld-rank.enum';

export class SeedSalaryTaxWithheldRankPermission1705394640933
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    for (const data in SalaryTaxWithheldRankPermission) {
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
