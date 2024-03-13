import { MigrationInterface, QueryRunner } from 'typeorm';

export class vaccinationNameTable1671243404790 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "vaccination_name" (
              "id" SERIAL NOT NULL,
              "version" integer DEFAULT 0,
              "name" VARCHAR(255) NOT NULL,
              "updated_by" integer,
              "created_by" integer,
              "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
              "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
              "deleted_at" TIMESTAMP WITH TIME ZONE,
              CONSTRAINT "pk_vaccination_name_id" PRIMARY KEY ("id"))
              `
    );

    await queryRunner.query(`
    CREATE UNIQUE INDEX "uk_vaccination_name_name" ON "vaccination_name" ("name")
    WHERE
      deleted_at is NULL;
  `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "vaccination_name"`);
  }
}
