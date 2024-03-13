import { MigrationInterface, QueryRunner } from 'typeorm';

export class authenticationUserRole1659606590822 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE "user_role" (
      "id" SERIAL NOT NULL,
      "version" integer NOT NULL,
      "user_id" integer,
      "role_id" integer,
      "updated_by" integer,
      "created_by" integer,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      "deleted_at" TIMESTAMP,
      CONSTRAINT "user_role_constrain" UNIQUE ("user_id", "role_id"),
      CONSTRAINT "fk_user_id_user_id" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
      CONSTRAINT "pk_user_role_id" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "fk_user_id_user_id"`
    );

    await queryRunner.query(`DROP TABLE "user_role"`);
  }
}
