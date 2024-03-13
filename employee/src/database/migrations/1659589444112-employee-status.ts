import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeStatus1659589444112 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "employee_status" (
        "id" SERIAL NOT NULL,
        "version" integer NOT NULL,
        "name" character varying NOT NULL,
        "description" character varying NOT NULL,
        "updated_by" integer,
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "uk_employee_status_name" UNIQUE ("name"),
        CONSTRAINT "pk_employee_status_id" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "employee_status"`);
  }
}
