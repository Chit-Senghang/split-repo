import { MigrationInterface, QueryRunner } from 'typeorm';

export class authenticationRole1659606796516 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE "role" (
      "id" SERIAL NOT NULL,
      "version" integer NOT NULL,
      "name" character varying NOT NULL,
      "description" character varying,
      "updated_by" integer,
      "created_by" integer,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      "deleted_at" TIMESTAMP,
      CONSTRAINT "uk_role_role_name" UNIQUE ("name"),
      CONSTRAINT "pk_role_id" PRIMARY KEY ("id"))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "role"`);
  }
}
