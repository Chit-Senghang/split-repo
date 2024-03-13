import { MigrationInterface, QueryRunner } from 'typeorm';

export class reasonTemplateInit1672900646780 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "reason_template" (
        "id" SERIAL NOT NULL,
        "version" integer NOT NULL DEFAULT(0),
        "type" VARCHAR(100) NOT NULL,
        "name" VARCHAR NOT NULL,
        "updated_by" integer,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "pk_reason_template" PRIMARY KEY ("id"),
        CONSTRAINT "fk_user_id_created_by" FOREIGN KEY ("created_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_user_id_updated_by" FOREIGN KEY ("updated_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)
    `
    );
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_reason_template" ON "reason_template" ("name")
        WHERE
        deleted_at is NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "reason_template"`);
  }
}
