import { MigrationInterface, QueryRunner } from 'typeorm';
import { codeValues } from '../../shared-resources/permission/code-value-permission';

export class SeedCodeValuePermission1686811110244
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // remove code-value or key-value from role-permission
    await queryRunner.manager.query(`
        DELETE FROM role_permission
        WHERE permission_id IN(
            SELECT id
            FROM permission
            WHERE name IN ('READ_CODE_VALUE', 'CREATE_CODE_VALUE', 'UPDATE_CODE_VALUE', 'DELETE_CODE_VALUE', 'KEY_VALUE'));
    `);

    // remove code-value or key-value from permission
    await queryRunner.manager.query(`
        DELETE FROM permission WHERE name IN('READ_CODE_VALUE', 'CREATE_CODE_VALUE', 'UPDATE_CODE_VALUE', 'DELETE_CODE_VALUE', 'KEY_VALUE');
    `);

    // add code-value permission
    for (const codeValue of codeValues) {
      await queryRunner.query(`
        INSERT INTO "permission" (version, "name", parent_id)
        VALUES(0, '${codeValue.name}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MANAGEMENT'));
      `);

      await queryRunner.query(`
        UPDATE  
          "permission"
        SET
          mpath = concat(get_permission_mpath('META_DATA_MODULE'), get_permission_mpath('EMPLOYEE_MANAGEMENT'), get_permission_mpath('${codeValue.name}'))
        WHERE name = '${codeValue.name}';
      `);

      for (const data in codeValue.sub) {
        await queryRunner.query(`
            INSERT INTO "permission" (version, "name", parent_id)
            VALUES(0, '${data}', (SELECT id FROM "permission" WHERE name = '${codeValue.name}'));
        `);

        await queryRunner.query(`
          UPDATE
            "permission"
          SET
            mpath = concat(get_permission_mpath('META_DATA_MODULE'), get_permission_mpath('EMPLOYEE_MANAGEMENT'), get_permission_mpath('${codeValue.name}'), get_permission_mpath('${data}'))
          WHERE name = '${data}';
      `);
      }
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
