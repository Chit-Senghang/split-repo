/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';
import { Logger } from '@nestjs/common';
import { ATTENDANCE_PERMISSION } from '../../shared-resources/ts/enum/permission/authentication/attendance.enum';

export class seedNewUserForAttendance1674442605528
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    try{
      const passwordSalt = Number(process.env.PASSWORD_SALT);
    const kongHost = process.env.KONG_URI;
    const users = await queryRunner.query(`
    INSERT INTO "user" (
      id, "version", username, "password", 
      phone, updated_by, created_by, created_at, 
      updated_at, deleted_at, email, is_self_service, 
      phone_verified, email_verified, is_system_defined
    ) 
    VALUES 
      (
        DEFAULT, 1, 'attendance_scheduler', '${bcrypt.hashSync('P@$$w0rd', passwordSalt)}', 
        '+855963382689', NULL, NULL, NOW(), 
        NOW(), NULL, 'attendance@gmail.com', false, true, true, true
      ) RETURNING id,phone, username;`);
    const resp = await axios.post(`${kongHost}/consumers/`, {
      username: users[0].username,
      // eslint-disable-next-line camelcase
      custom_id: String(users[0].id)
    });

    await queryRunner.query(`
        INSERT INTO "user_consumer" (
    id, "version", consumer_id, "user_id", 
    updated_by, created_by, created_at, 
    updated_at, deleted_at) 
    VALUES 
    (
        DEFAULT, 1, '${resp.data.id}',${users[0].id}, NULL, NULL, NOW(), 
        NOW(), NULL
    );`);

    //* Insert seed permission with attendance (permission= create, read)
    await queryRunner.query(`
     INSERT INTO "permission" (version, "name",parent_id)
     VALUES(2, 'ATTENDANCE_PERMISSION', (SELECT id FROM "permission" WHERE name = 'AUTHENTICATION_MODULE'));
 `);

    for (const data in ATTENDANCE_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'ATTENDANCE_PERMISSION'));
        `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('AUTHENTICATION_MODULE,ATTENDANCE_PERMISSION,${data}'))
            WHERE name = '${data}';
        `);
    }

    await queryRunner.query(`
        UPDATE
          "permission"
        SET
          mpath = get_permission_mpath('AUTHENTICATION_MODULE,ATTENDANCE_PERMISSION')
        WHERE name = 'ATTENDANCE_PERMISSION';
        `);

    // Insert Role with attendance
    await queryRunner.query(`
        INSERT INTO "role" (version, "name", "description")
        VALUES (1, 'Attendance Scheduler', 'attendance');
    `);

    const roles = await queryRunner.query(
        `SELECT id FROM "role" where "name" = 'Admin';`
    );

    await queryRunner.query(`
      INSERT INTO "user_role" (
        id, "version", "role_id", "user_id", 
        updated_by, created_by, created_at, 
        updated_at, deleted_at) 
      VALUES 
        (
          DEFAULT, 1, '${roles[0].id}',${users[0].id}, NULL, NULL, NOW(), 
          NOW(), NULL
      );
    `);
    }catch(e){
      Logger.log(e);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
