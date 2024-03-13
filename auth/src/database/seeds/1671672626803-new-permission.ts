import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  AUTHENTICATION_PERMISSION,
  CODE_VALUE_PERMISSION,
  EMPLOYEE_MASTER_INFORMATION_PERMISSION,
  EMPLOYEE_MOVEMENT_PERMISSION,
  EMPLOYEE_PAYGRADE_PERMISSION,
  EMPLOYEE_QUALIFICATION_PERMISSION,
  EMPLOYEE_STATUS_PERMISSION,
  EMPLOYEE_WARNING_PERMISSION,
  GLOBAL_CONFIGURATION_PERMISSION,
  JOB_TITLE_PERMISSION,
  ROLE_PERMISSION,
  ROLE_PERMISSION_PERMISSION,
  USER_PERMISSION
} from '../../shared-resources/ts/enum/permission';
import { PERMISSION } from '../../shared-resources/ts/enum/permission/authentication/permission.enum';
import { SepcialModule } from '../../shared-resources/permission/special.permission';

export class newPermission1671672626803 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            TRUNCATE "permission" CASCADE;
        `);
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name")
            VALUES (2, 'SPECIAL_MODULE');
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('SPECIAL_MODULE')
        WHERE name = 'SPECIAL_MODULE';
    `);
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name", parent_id)
            VALUES(2, 'ALL_FUNCTION', (SELECT id FROM "permission" WHERE name = 'SPECIAL_MODULE'));
        `);
    await queryRunner.query(`
            UPDATE
              "permission"
            SET
              mpath = get_permission_mpath('SPECIAL_MODULE,ALL_FUNCTION')
            WHERE name = 'ALL_FUNCTION';
        `);
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'READ_ALL_FUNCTION', (SELECT id FROM "permission" WHERE name = 'SPECIAL_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('SPECIAL_MODULE,READ_ALL_FUNCTION')
        WHERE name = 'READ_ALL_FUNCTION';
    `);
    //*Authentication Parent Tree
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name")
            VALUES (2, 'AUTHENTICATION_MODULE');
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('AUTHENTICATION_MODULE')
        WHERE name = 'AUTHENTICATION_MODULE';
    `);
    //*Permission Module
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'PERMISSION', (SELECT id FROM "permission" WHERE name = 'AUTHENTICATION_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('AUTHENTICATION_MODULE,PERMISSION')
        WHERE name = 'PERMISSION';
        `);
    for (const data in PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'PERMISSION'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('AUTHENTICATION_MODULE,PERMISSION,${data}'))
            WHERE name = '${data}';
        `);
    }
    //*User Module
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'USER', (SELECT id FROM "permission" WHERE name = 'AUTHENTICATION_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('AUTHENTICATION_MODULE,USER')
        WHERE name = 'USER';
        `);
    for (const data in USER_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'USER'));
         `);
      await queryRunner.query(`
            UPDATE
                "permission"
            SET
                mpath = (get_permission_mpath('AUTHENTICATION_MODULE,USER,${data}'))
            WHERE name = '${data}';
        `);
    }
    //*Role Module
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'ROLE', (SELECT id FROM "permission" WHERE name = 'AUTHENTICATION_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('AUTHENTICATION_MODULE,ROLE')
        WHERE name = 'ROLE';
        `);
    for (const data in ROLE_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'ROLE'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('AUTHENTICATION_MODULE,ROLE,${data}'))
            WHERE name = '${data}';
        `);
    }
    //*Role Permission Module
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'ROLE_PERMISSION', (SELECT id FROM "permission" WHERE name = 'AUTHENTICATION_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('AUTHENTICATION_MODULE,ROLE_PERMISSION')
        WHERE name = 'ROLE_PERMISSION';
        `);
    for (const data in ROLE_PERMISSION_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'ROLE_PERMISSION'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('AUTHENTICATION_MODULE,ROLE_PERMISSION,${data}'))
            WHERE name = '${data}';
        `);
    }
    //* Authentication Module
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'AUTHENTICATION', (SELECT id FROM "permission" WHERE name = 'AUTHENTICATION_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('AUTHENTICATION_MODULE,AUTHENTICATION')
        WHERE name = 'AUTHENTICATION';
        `);
    for (const data in AUTHENTICATION_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'AUTHENTICATION'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('AUTHENTICATION_MODULE,AUTHENTICATION,${data}'))
            WHERE name = '${data}';
        `);
    }
    //*Employee Parent Tree
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name")
            VALUES (2, 'EMPLOYEE_MODULE');
    `);
    await queryRunner.query(`
    UPDATE
      "permission"
    SET
      mpath = get_permission_mpath('EMPLOYEE_MODULE')
    WHERE name = 'EMPLOYEE_MODULE';
`);
    //* Employee master information module
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'EMPLOYEE_MASTER_INFORMATION', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_MASTER_INFORMATION')
        WHERE name = 'EMPLOYEE_MASTER_INFORMATION';
        `);
    for (const data in EMPLOYEE_MASTER_INFORMATION_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MASTER_INFORMATION'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_MASTER_INFORMATION,${data}'))
            WHERE name = '${data}';
        `);
    }
    //* EMPLOYEE_MOVEMENT Module
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'EMPLOYEE_RESIGNATION', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_RESIGNATION')
        WHERE name = 'EMPLOYEE_RESIGNATION';
        `);
    for (const data in EMPLOYEE_MOVEMENT_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_RESIGNATION'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_RESIGNATION,${data}'))
            WHERE name = '${data}';
        `);
    }
    //* EMPLOYEE_STATUS MODULE
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'EMPLOYEE_STATUS', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_STATUS')
        WHERE name = 'EMPLOYEE_STATUS';
        `);
    for (const data in EMPLOYEE_STATUS_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_STATUS'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_RESIGNATION,${data}'))
            WHERE name = '${data}';
        `);
    }
    //* EMPLOYEE_WARNING
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'EMPLOYEE_WARNING', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_WARNING')
        WHERE name = 'EMPLOYEE_WARNING';
        `);
    for (const data in EMPLOYEE_WARNING_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_WARNING'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('EMPLOYEE_MODULE,EMPLOYEE_WARNING,${data}'))
            WHERE name = '${data}';
        `);
    }
    //* JOB_TITLE
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'JOB_TITLE', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('EMPLOYEE_MODULE,JOB_TITLE')
        WHERE name = 'JOB_TITLE';
        `);
    for (const data in JOB_TITLE_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'JOB_TITLE'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('EMPLOYEE_MODULE,JOB_TITLE,${data}'))
            WHERE name = '${data}';
        `);
    }
    //* KEY_VALUE
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'KEY_VALUE', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('EMPLOYEE_MODULE,KEY_VALUE')
        WHERE name = 'KEY_VALUE';
        `);
    for (const data in CODE_VALUE_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'KEY_VALUE'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('EMPLOYEE_MODULE,KEY_VALUE,${data}'))
            WHERE name = '${data}';
        `);
    }
    //* PAY_GRADE
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'PAY_GRADE', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('EMPLOYEE_MODULE,PAY_GRADE')
        WHERE name = 'PAY_GRADE';
        `);
    for (const data in EMPLOYEE_PAYGRADE_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'PAY_GRADE'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('EMPLOYEE_MODULE,PAY_GRADE,${data}'))
            WHERE name = '${data}';
        `);
    }
    //* QUALIFICATION
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'QUALIFICATION', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('EMPLOYEE_MODULE,QUALIFICATION')
        WHERE name = 'QUALIFICATION';
        `);
    for (const data in EMPLOYEE_QUALIFICATION_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'QUALIFICATION'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('EMPLOYEE_MODULE,QUALIFICATION,${data}'))
            WHERE name = '${data}';
        `);
    }

    //* GLOBAL_CONFIGURATION
    await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'GLOBAL_CONFIGURATION', (SELECT id FROM "permission" WHERE name = 'EMPLOYEE_MODULE'));
        `);
    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('EMPLOYEE_MODULE,GLOBAL_CONFIGURATION')
        WHERE name = 'GLOBAL_CONFIGURATION';
        `);
    for (const data in GLOBAL_CONFIGURATION_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'GLOBAL_CONFIGURATION'));
         `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('EMPLOYEE_MODULE,GLOBAL_CONFIGURATION,${data}'))
            WHERE name = '${data}';
        `);
    }

    //* Insert Role
    const admin = await queryRunner.query(
      `
        SELECT * FROM "role" WHERE name = 'Admin';
    `
    );

    const adminPermission = await queryRunner.query(
      `SELECT id FROM public."permission" where "name" = '${SepcialModule[0].default.admin}';`
    );
    await queryRunner.query(
      `INSERT INTO "role_permission" 
        (id, "version", "role_id", "permission_id", updated_by, created_by, created_at, updated_at, deleted_at) 
        VALUES(DEFAULT, 1,${admin[0].id},${adminPermission[0].id}, NULL, NULL, now(), now(), NULL);`
    );

    const user = await queryRunner.query(
      `SELECT * FROM "role" WHERE name ='User';
      `
    );

    const userPermission = await queryRunner.query(
      `SELECT id FROM "permission" where "name" = '${SepcialModule[0].default.user}';`
    );

    await queryRunner.query(
      `INSERT INTO "role_permission" 
        (id, "version", "role_id", "permission_id", updated_by, created_by, created_at, updated_at, deleted_at) 
        VALUES(DEFAULT, 1,${user[0].id},${userPermission[0].id}, NULL, NULL, now(), now(), NULL);`
    );
  }

  async down(): Promise<void> {
    return;
  }
}
