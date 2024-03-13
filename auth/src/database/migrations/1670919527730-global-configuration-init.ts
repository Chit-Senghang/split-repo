import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export class globalConfigurationInit1669703986465
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    const passwordSalt = Number(process.env.PASSWORD_SALT);
    await queryRunner.query(
      `CREATE TABLE "global_configuration" (
            "id" SERIAL NOT NULL,
            "version" integer DEFAULT(0),
            "name" character varying UNIQUE NOT NULL,
            "is_enable" BOOLEAN DEFAULT (FALSE),
            "is_system_defined" BOOLEAN DEFAULT (FALSE),
            "value" character varying NOT NULL,
            "description" character varying NULL,
            "updated_by" integer,
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "fk_user_id_update_by" FOREIGN KEY ("updated_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "pk_global_configuration_id" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_system_defined" boolean NOT NULL DEFAULT false;`
    );
    await queryRunner.query(
      `INSERT INTO "user" 
      (
        "version",
        "password",
        "username",
        "phone"
      ) 
      VALUES 
      (
        '0',
        '${bcrypt.hashSync('P@$$w0rd', passwordSalt)}',
        'system',
        '+85598592809'
      );`
    );
    await queryRunner.query(
      `INSERT INTO global_configuration
        (
          "name",
          "is_enable",
          "is_system_defined",
          "value",
          "description",
          "updated_by"
        )
      VALUES
        (
          'enable-strong-password',
          'TRUE',
          'FALSE',
          '(?=[A-Za-z0-9@#$%^&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{8,}).*$',
          'Assert a string that has at least one uppercase letter, one lowercase letter, one number and one special character!',
          (SELECT id FROM public."user" WHERE "username" = 'system')
          );`
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "gloabl_configuration"`);
  }
}
