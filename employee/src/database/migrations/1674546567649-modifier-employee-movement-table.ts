import { MigrationInterface, QueryRunner } from 'typeorm';

export class modifierEmployeeMovementTable1674546567649
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE employee_movement`);

    await queryRunner.query(
      `CREATE TABLE "employee_movement" (
              "id" SERIAL NOT NULL,
              "version" INTEGER NOT NULL DEFAULT 0,
              "employee_id" INTEGER,
              "previous_employment_type" INTEGER NOT NULL,
              "request_movement_employee_position_id" INTEGER NOT NULL,
              "previous_company_structure_position_id" INTEGER NULL,
              "previous_working_shift_id" INTEGER NULL,
              "new_employment_type" VARCHAR(10) NULL,
              "new_company_structure_position_id" INTEGER NULL,
              "new_working_shift_id" INTEGER NULL,
              "reason" VARCHAR(255) NULL,
              "effective_date" DATE NOT NULL,
              "last_movement_date" DATE NOT NULL,
              "status" VARCHAR(10) DEFAULT 'PENDING',
              "updated_by" INTEGER,
              "created_by" INTEGER,
              "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
              "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
              "deleted_at" TIMESTAMPTZ,

              CONSTRAINT "pk_employee_movement_id" PRIMARY KEY ("id"),
              CONSTRAINT "fk_employee_id_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
              CONSTRAINT "fk_request_movement_employee_position_id_employee_position_id" FOREIGN KEY ("request_movement_employee_position_id") REFERENCES "employee_position"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
              CONSTRAINT "fk_previous_company_structure_position_id_company_structure_id" FOREIGN KEY ("previous_company_structure_position_id") REFERENCES "company_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,  
              CONSTRAINT "fk_previous_working_shift_id_working_shift_id" FOREIGN KEY ("previous_working_shift_id") REFERENCES "working_shift"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
              CONSTRAINT "fk_new_company_structure_position_id_company_structure_id" FOREIGN KEY ("new_company_structure_position_id") REFERENCES "company_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
              CONSTRAINT "fk_new_working_shift_id_working_shift_id" FOREIGN KEY ("new_working_shift_id") REFERENCES "working_shift"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
              )`
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
