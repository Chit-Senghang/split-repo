import { MigrationInterface, QueryRunner } from 'typeorm';

export class modifyEmployeeResignation1674715492767
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE "employee_resignation";
        CREATE TABLE "employee_resignation" (
            "id" SERIAL NOT NULL,
            "version" INTEGER DEFAULT 0,
            "employee_id" INTEGER NOT NULL,
            "resign_type_id" INTEGER NOT NULL,
            "resign_date" TIMESTAMPTZ NOT NULL,
            "reason" VARCHAR NOT NULL,
            "status" VARCHAR(10),
            "updated_by" INTEGER,
            "created_by" INTEGER,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NULL,
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "pk_employee_resignation" PRIMARY KEY ("id"),
            CONSTRAINT "fk_employee_id_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "fk_resign_type_id_code_value_id" FOREIGN KEY ("resign_type_id") REFERENCES "code_value" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE "employee_resignation";
    `);
  }
}
