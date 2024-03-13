import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeJobTitle1659595599361 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "job_title" (
        "id" SERIAL NOT NULL,
        "version" integer NOT NULL,
        "title" character varying NOT NULL,
        "description" character varying,
        "specification" character varying,
        "code" character varying NOT NULL,
        "updated_by" integer,
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "uk_job_title_title" UNIQUE ("title"),
        CONSTRAINT "uk_job_title_code" UNIQUE ("code"),
        CONSTRAINT "pk_job_title_id" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "job_title"`);
  }
}
