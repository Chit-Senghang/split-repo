import axios from 'axios';
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Logger } from '@nestjs/common';

export class seedUserData1660555854541 implements MigrationInterface {
  name?: string;

  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      const passwordSalt = Number(process.env.PASSWORD_SALT);
      const kongHost = process.env.KONG_URI;
      const users = await queryRunner.query(`
    INSERT INTO public."user" (
  id, "version", username, "password", 
  phone, updated_by, created_by, created_at, 
  updated_at, deleted_at, email, is_self_service, 
  phone_verified, email_verified
) 
VALUES 
  (
    DEFAULT, 1, 'admin', '${bcrypt.hashSync('admin123', passwordSalt)}', 
    '+85596123213', NULL, NULL, NOW(), 
    NOW(), NULL, 'admin@gmail.com', false, true, true
  ) RETURNING id,phone,username;`);

      const resp = await axios.post(`${kongHost}/consumers/`, {
        username: users[0].username,
        // eslint-disable-next-line camelcase
        custom_id: String(users[0].id)
      });
      await queryRunner.query(`
    INSERT INTO public."user_consumer" (
  id, "version", consumer_id, "user_id", 
  updated_by, created_by, created_at, 
  updated_at, deleted_at) 
VALUES 
  (
    DEFAULT, 1, '${resp.data.id}',${users[0].id}, NULL, NULL, NOW(), 
    NOW(), NULL
  );`);

      const roles = await queryRunner.query(
        `SELECT id FROM public."role" where "name" = 'Admin';`
      );
      await queryRunner.query(`
    INSERT INTO public."user_role" (
  id, "version", "role_id", "user_id", 
  updated_by, created_by, created_at, 
  updated_at, deleted_at) 
VALUES 
  (
    DEFAULT, 1, '${roles[0].id}',${users[0].id}, NULL, NULL, NOW(), 
    NOW(), NULL
  );`);
    } catch (e) {
      Logger.log(e);
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
