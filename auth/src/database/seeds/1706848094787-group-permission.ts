import { MigrationInterface, QueryRunner } from 'typeorm';
import { BenefitAdjustmentTypePermissionEnum } from '../../shared-resources/ts/enum/permission/employee/benefit-adjustment-type.enum';
import { SalaryTaxWithheldRankPermission } from '../../shared-resources/ts/enum/permission/employee/salay-tax-withheld-rank.enum';
import { PayrollCycleConfigurationPermissionEnum } from '../../shared-resources/ts/enum/permission/employee/payroll-cycle-configuration.enum';

export class GroupPermission1706848094787 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    //Delete previous permissions of benefit adjustment type
    await deletePermissionByGivenEnum(
      queryRunner,
      BenefitAdjustmentTypePermissionEnum
    );

    //Delete previous permissions of salary tax withheld rank
    await deletePermissionByGivenEnum(
      queryRunner,
      SalaryTaxWithheldRankPermission
    );

    //Delete previous permissions of payroll cycle configuration
    await deletePermissionByGivenEnum(
      queryRunner,
      PayrollCycleConfigurationPermissionEnum
    );

    // ========================== [Seed permissions with grouping] ==========================
    const parentModule = 'META_DATA_MODULE';
    //payroll cycle configuration
    await seedPermissionWithGroupingByEnum(
      queryRunner,
      'PAYROLL_CYCLE_CONFIGURATION',
      parentModule,
      PayrollCycleConfigurationPermissionEnum
    );

    //salary tax withheld rank
    await seedPermissionWithGroupingByEnum(
      queryRunner,
      'SALARY_TAX_WITHHELD_RANK',
      parentModule,
      SalaryTaxWithheldRankPermission
    );

    //salary tax withheld rank
    await seedPermissionWithGroupingByEnum(
      queryRunner,
      'BENEFIT_ADJUSTMENT_TYPE',
      parentModule,
      BenefitAdjustmentTypePermissionEnum
    );
  }

  async down(): Promise<void> {}
}

const seedPermissionWithGroupingByEnum = async (
  queryRunner: QueryRunner,
  moduleName: string,
  parentName: string,
  enumPermission: any
): Promise<void> => {
  await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${moduleName}', (SELECT id FROM "permission" WHERE name = '${parentName}'));
    `);

  await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = get_permission_mpath('${parentName},${moduleName}')
        WHERE name = '${moduleName}';
    `);

  for (const data in enumPermission) {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = '${moduleName}'));
    `);
    await queryRunner.query(`
        UPDATE
        "permission"
        SET
        mpath = (get_permission_mpath('${parentName},${moduleName},${data}'))
        WHERE name = '${data}';
    `);
  }
};

const deletePermissionByGivenEnum = async (
  queryRunner: QueryRunner,
  permissionEnum: any
) => {
  //Remove role_permission
  await queryRunner.query(`
      DELETE FROM role_permission
      WHERE permission_id IN (SELECT id FROM permission WHERE name IN(${Object.values(
        permissionEnum
      ).map((item: string) => `'${item}'`)}))
  `);

  //Remove permission
  await queryRunner.query(`
    DELETE FROM permission
    WHERE name IN(${Object.values(permissionEnum).map(
      (item: string) => `'${item}'`
    )})
  `);
};
