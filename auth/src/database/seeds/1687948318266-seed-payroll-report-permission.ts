import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPayrollReportPermission1687948318266
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`  
    insert into "permission" ("name", "version")
    values ('PAYROLL_REPORT', 1);

    insert into "permission" ("name", "version")
    values ('READ_PAYROLL_REPORT', 1);

    insert into "permission" ("name", "version")
    values ('UPDATE_PAYROLL_REPORT', 1);

    insert into "permission" ("name", "version")
    values ('CREATE_PAYROLL_REPORT', 1);

    insert into "permission" ("name", "version")
    values ('DELETE_PAYROLL_REPORT', 1);

    update "permission"
    set mpath = get_permission_mpath('PAYROLL_MODULE,PAYROLL_REPORT')
    where "name" = 'PAYROLL_REPORT';

    update "permission"
    set mpath = get_permission_mpath('PAYROLL_MODULE,PAYROLL_REPORT,READ_PAYROLL_REPORT')
    where "name" = 'READ_PAYROLL_REPORT';

    update "permission"
    set mpath = get_permission_mpath('PAYROLL_MODULE,PAYROLL_REPORT,UPDATE_PAYROLL_REPORT')
    where "name" = 'UPDATE_PAYROLL_REPORT';

    update "permission"
    set mpath = get_permission_mpath('PAYROLL_MODULE,PAYROLL_REPORT,CREATE_PAYROLL_REPORT')
    where "name" = 'CREATE_PAYROLL_REPORT';

    update "permission"
    set mpath = get_permission_mpath('PAYROLL_MODULE,PAYROLL_REPORT,DELETE_PAYROLL_REPORT')
    where "name" = 'DELETE_PAYROLL_REPORT';
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
