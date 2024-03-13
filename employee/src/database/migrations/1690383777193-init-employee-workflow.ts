import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitEmployeeWorkflow1690383777193 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "employee_workflow" (
            "id" SERIAL NOT NULL,
            "version" INTEGER DEFAULT 0,
            "approval_status_id" INTEGER NOT NULL,
            "employee_id" INTEGER NOT NULL,
            "action_type" VARCHAR(20) NOT NULL,
            "updated_by" INTEGER,
            "created_by" INTEGER,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "pk_employee_workflow_id" PRIMARY KEY (id),
            CONSTRAINT "fk_employee_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employee" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "fk_approval_status_approval_status_id" FOREIGN KEY ("approval_status_id") REFERENCES "approval_status" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
          )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE employee_workflow;
    `);
  }
}
