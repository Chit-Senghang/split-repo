import { MigrationInterface, QueryRunner } from 'typeorm';
import { payrollBenefitAdjustment } from '../../shared-resources/permission/payroll-benefit-adjustment-permission';

export class MovePayrollBenefitAdjustmentToPayrollModule1688355344208
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // update sub parents
    await queryRunner.manager.query(`
      UPDATE
        permission
      SET 
        parent_id = (SELECT id FROM permission WHERE name = '${payrollBenefitAdjustment.name}'),
        mpath = concat(get_permission_mpath('${payrollBenefitAdjustment.name}'), get_permission_mpath('${payrollBenefitAdjustment.sub.name}'))
      WHERE name = '${payrollBenefitAdjustment.sub.name}';
    `);

    // update sub chiles by parents
    for (const subChildPayrollBenefitAdjustment in payrollBenefitAdjustment.sub
      .sub) {
      await queryRunner.manager.query(`
        UPDATE
            permission
        SET
          parent_id = (SELECT id FROM permission WHERE name = '${payrollBenefitAdjustment.sub.name}'),
          mpath = concat(get_permission_mpath('${payrollBenefitAdjustment.name}'), get_permission_mpath('${payrollBenefitAdjustment.sub.name}'), get_permission_mpath('${subChildPayrollBenefitAdjustment}'))
        WHERE name = '${subChildPayrollBenefitAdjustment}';
    `);
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
