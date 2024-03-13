import { MigrationInterface, QueryRunner } from 'typeorm';
import { BENEFIT_INCREASEMENT_POLICY_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/benefit-increasement-policy.enum';

export class SeedBenefitIncreasementPolicyPermission1689158128184
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'BENEFIT_INCREASEMENT_POLICY', (SELECT id FROM "permission" WHERE name = 'META_DATA_MODULE'));
    `);

    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('META_DATA_MODULE,BENEFIT_INCREASEMENT_POLICY')
        WHERE name = 'BENEFIT_INCREASEMENT_POLICY';
    `);

    for (const data in BENEFIT_INCREASEMENT_POLICY_PERMISSION) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'BENEFIT_INCREASEMENT_POLICY'));
    `);
      await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('META_DATA_MODULE,BENEFIT_INCREASEMENT_POLICY,${data}'))
        WHERE name = '${data}';
    `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
