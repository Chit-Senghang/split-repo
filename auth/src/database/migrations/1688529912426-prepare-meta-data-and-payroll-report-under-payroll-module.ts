import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  payrollManagements,
  payrollReports
} from '../../shared-resources/permission/meta-data-permission';

export class PrepareMetaDataAndPayrollReportUnderPayrollModule1688529912426
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // insert meta payroll management
    await queryRunner.query(`
        INSERT INTO 
            "permission" (version, "name", parent_id)
        VALUES
        (0, 'PAYROLL_MANAGEMENT', (SELECT id FROM "permission" WHERE name = 'META_DATA_MODULE'));
  `);

    // update mpath meta payroll management
    await queryRunner.query(`
        UPDATE
            "permission"
        SET
            mpath = concat(get_permission_mpath('META_DATA_MODULE'), get_permission_mpath('PAYROLL_MANAGEMENT'))
        WHERE name = 'PAYROLL_MANAGEMENT';
    `);

    // meta data payroll management
    // update sub parents
    await queryRunner.manager.query(`
        UPDATE
            permission
        SET
            parent_id = (SELECT id FROM permission WHERE name = '${payrollManagements.name}'),
            mpath = concat(get_permission_mpath('${payrollManagements.name}'), get_permission_mpath('${payrollManagements.sub.name}'))
        WHERE name = '${payrollManagements.sub.name}';
    `);

    // update sub chiles
    for (const subPayrollManagement of payrollManagements.sub.sub) {
      await queryRunner.manager.query(`
        UPDATE
            permission
        SET
            parent_id = (SELECT id FROM permission WHERE name = '${payrollManagements.sub.name}'),
            mpath = concat(get_permission_mpath('${payrollManagements.name}'), get_permission_mpath('${payrollManagements.sub.name}'), get_permission_mpath('${subPayrollManagement.name}'))
        WHERE name = '${subPayrollManagement.name}';
    `);
      for (const subChilePayrollManagement in subPayrollManagement.sub) {
        await queryRunner.manager.query(`
            UPDATE
                permission
            SET
                parent_id = (SELECT id FROM permission WHERE name = '${subPayrollManagement.name}'),
                mpath = concat(get_permission_mpath('${payrollManagements.name}'), get_permission_mpath('${payrollManagements.sub.name}'), get_permission_mpath('${subPayrollManagement.name}'), get_permission_mpath('${subChilePayrollManagement}'))
            WHERE name = '${subChilePayrollManagement}';
        `);
      }
    }

    // payroll report
    // update sub parents
    await queryRunner.manager.query(`
        UPDATE
            permission
        SET
            parent_id = (SELECT id FROM permission WHERE name = '${payrollReports.name}'),
            mpath = concat(get_permission_mpath('${payrollReports.name}'), get_permission_mpath('${payrollReports.sub.name}'))
        WHERE name = '${payrollReports.sub.name}';
    `);

    for (const payrollReport in payrollReports.sub.sub) {
      // update sub parents
      await queryRunner.manager.query(`
        UPDATE
            permission
        SET
            parent_id = (SELECT id FROM permission WHERE name = '${payrollReports.sub.name}'),
            mpath = concat(get_permission_mpath('${payrollReports.name}'), get_permission_mpath('${payrollReports.sub.name}'), get_permission_mpath('${payrollReports}'))
        WHERE name = '${payrollReport}';
    `);
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
