import { MigrationInterface, QueryRunner } from 'typeorm';
import { salaryComponentAndSalaryComponentType } from '../../shared-resources/permission/salary-component-and-salary-component-type';

export class MoveSalaryComponentAndSalaryComponentTypeToMetaData1687515643348
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // update sub parents
    for (const subSalaryComponentAndSalaryComponentType of salaryComponentAndSalaryComponentType.sub) {
      await queryRunner.manager.query(`
        UPDATE
          permission
        SET 
          parent_id = (SELECT id FROM permission WHERE name = '${salaryComponentAndSalaryComponentType.name}'),
          mpath = concat(get_permission_mpath('${salaryComponentAndSalaryComponentType.name}'), get_permission_mpath('${subSalaryComponentAndSalaryComponentType.name}'))
        WHERE name = '${subSalaryComponentAndSalaryComponentType.name}';
      `);

      // update sub chiles by parents
      for (const subChildSalaryComponentAndSalaryComponentType in subSalaryComponentAndSalaryComponentType.sub) {
        await queryRunner.manager.query(`
            UPDATE
                permission
            SET
                mpath = concat(get_permission_mpath('${salaryComponentAndSalaryComponentType.name}'), get_permission_mpath('${subSalaryComponentAndSalaryComponentType.name}'), get_permission_mpath('${subChildSalaryComponentAndSalaryComponentType}'))
            WHERE name = '${subChildSalaryComponentAndSalaryComponentType}';
        `);
      }
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
