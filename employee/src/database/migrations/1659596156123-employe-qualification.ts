import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeQualification1659596156123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "qualification" (
        "id" SERIAL NOT NULL,
        "version" integer NOT NULL,
        "name" character varying NOT NULL,
        "description" character varying NOT NULL,
        "type" character varying NOT NULL,
        "updated_by" integer,
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "uk_qualificaiton_name_type" UNIQUE ("name", "type"),
        CONSTRAINT "pk_qualification_id" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "qualification"`);
  }
}
