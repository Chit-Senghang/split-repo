import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeVaccinationInit1672391238361
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "vaccination_name" RENAME TO "vaccination";
    `);
    await queryRunner.query(`
        CREATE TABLE "employee_vaccination" (
            "id" SERIAL NOT NULL,
            "version" integer DEFAULT 0,
            "employee_id" integer NOT NULL,
            "vaccination_id" integer NOT NULL,
            "card_number" VARCHAR(100) NOT NULL,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NULL,
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "pk_employee_vaccination" PRIMARY KEY ("id"),
            CONSTRAINT "fk_vaccination_id_vaccination_id" FOREIGN KEY ("vaccination_id") REFERENCES "vaccination" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "fk_employee_id_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_employee_vaccination_employee_id_vaccination_id" ON "employee_vaccination" ("employee_id","vaccination_id")
        WHERE
            deleted_at is NULL;
    `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "uk_employee_vaccination_employee_id_vaccination_id_card_number" ON "employee_vaccination" ("employee_id","vaccination_id","card_number")
        WHERE
            deleted_at is NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "employee_vaccination"`);
  }
}
