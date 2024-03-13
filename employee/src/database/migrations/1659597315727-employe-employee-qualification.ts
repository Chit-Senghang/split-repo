import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeEmployeeQualification1659597315727
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "employee_qualification" (
        "id" SERIAL NOT NULL,
        "version" integer NOT NULL,
        "employee_id" integer,
        "qualification_id" integer,
        "updated_by" integer,
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_edf4a6aee7eaada4c3d00236587" PRIMARY KEY ("id"),
        CONSTRAINT "fk_employee_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_qualification_qualification_id" FOREIGN KEY ("qualification_id") REFERENCES "qualification" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_qualification" DROP CONSTRAINT "fk_qualification_qualification_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_qualification" DROP CONSTRAINT "fk_employee_employee_id"`
    );

    await queryRunner.query(`DROP TABLE "employee_qualification"`);
  }
}
