import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeTrainingInit1673230934563 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "employee_training" (
            "id" SERIAL NOT NULL,
            "version" integer DEFAULT 0,
            "employee_id" integer NOT NULL,
            "training_id" integer NOT NULL,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NULL,
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "pk_employee_training" PRIMARY KEY ("id"),
            CONSTRAINT "fk_employee_id_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "fk_training_id_code_value_id" FOREIGN KEY ("training_id") REFERENCES "code_value" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_employee_id_training_id" ON "employee_training" ("employee_id","training_id")
        WHERE
            deleted_at is NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "employee_training"`);
  }
}
