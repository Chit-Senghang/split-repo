import { MigrationInterface, QueryRunner } from 'typeorm';

export class PayrollBenefitAdjustmentPermission1687543187181
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`  
    insert into "permission" ("name", "version")
    values ('PAYROLL_BENEFIT_ADJUSTMENT', 1);

    insert into "permission" ("name", "version")
    values ('READ_PAYROLL_BENEFIT_ADJUSTMENT', 1);

    insert into "permission" ("name", "version")
    values ('UPDATE_PAYROLL_BENEFIT_ADJUSTMENT', 1);

    insert into "permission" ("name", "version")
    values ('CREATE_PAYROLL_BENEFIT_ADJUSTMENT', 1);

    insert into "permission" ("name", "version")
    values ('DELETE_PAYROLL_BENEFIT_ADJUSTMENT', 1);

    update "permission"
    set mpath = get_permission_mpath('PAYROLL_MODULE,PAYROLL_BENEFIT_ADJUSTMENT')
    where "name" = 'PAYROLL_BENEFIT_ADJUSTMENT';

    update "permission"
    set mpath = get_permission_mpath('PAYROLL_MODULE,PAYROLL_BENEFIT_ADJUSTMENT,READ_PAYROLL_BENEFIT_ADJUSTMENT')
    where "name" = 'READ_PAYROLL_BENEFIT_ADJUSTMENT';

    update "permission"
    set mpath = get_permission_mpath('PAYROLL_MODULE,PAYROLL_BENEFIT_ADJUSTMENT,UPDATE_PAYROLL_BENEFIT_ADJUSTMENT')
    where "name" = 'UPDATE_PAYROLL_BENEFIT_ADJUSTMENT';

    update "permission"
    set mpath = get_permission_mpath('PAYROLL_MODULE,PAYROLL_BENEFIT_ADJUSTMENT,CREATE_PAYROLL_BENEFIT_ADJUSTMENT')
    where "name" = 'CREATE_PAYROLL_BENEFIT_ADJUSTMENT';

    update "permission"
    set mpath = get_permission_mpath('PAYROLL_MODULE,PAYROLL_BENEFIT_ADJUSTMENT,DELETE_PAYROLL_BENEFIT_ADJUSTMENT')
    where "name" = 'DELETE_PAYROLL_BENEFIT_ADJUSTMENT';
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
