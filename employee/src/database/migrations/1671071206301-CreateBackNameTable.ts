import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBackNameTable1671071206301 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bank_name" (
        "id" SERIAL NOT NULL,
        "version" integer DEFAULT 0,
        "name" VARCHAR(255) NOT NULL,
        "updated_by" integer,
        "created_by" integer,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "pk_bank_name_id" PRIMARY KEY ("id"))
        `
    );

    await queryRunner.query(`
    CREATE UNIQUE INDEX "uk_bank_name_name" ON "bank_name" ("name")
    WHERE
      deleted_at is NULL;
  `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bank_name"`);
  }
}
