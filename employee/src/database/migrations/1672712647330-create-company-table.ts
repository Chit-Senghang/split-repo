import { MigrationInterface, QueryRunner } from 'typeorm';

export class createCompanyTable1672712647330 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "company" (
                        "id" SERIAL NOT NULL,
                        "version" integer NOT NULL DEFAULT(0),
                        "name" VARCHAR(255) NOT NULL,
                        "updated_by" integer,
                        "created_by" integer,
                        "created_at" TIMESTAMPTZ DEFAULT now(),
                        "updated_at" TIMESTAMPTZ DEFAULT now(),
                        "deleted_at" TIMESTAMPTZ,
                        CONSTRAINT "pk_company_id" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(`
          CREATE UNIQUE INDEX "uk_company_name" ON "company" ("name")
          WHERE
            deleted_at is NULL;
        `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "company"`);
  }
}
