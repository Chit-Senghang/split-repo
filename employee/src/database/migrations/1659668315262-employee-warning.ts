import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeInit1659668315262 implements MigrationInterface {
  name = 'employee1659668315262';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "employee_warning" (
            "id" SERIAL NOT NULL, 
            "version" integer NOT NULL, 
            "warning_date" TIMESTAMP NOT NULL, 
            "warning_round" integer NOT NULL DEFAULT '1', 
            "employee_id" integer, 
            "warning_type_id" integer, 
            "updated_by" integer, 
            "created_by" integer, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "deleted_at" TIMESTAMP, 
            CONSTRAINT "pk_employee_warning_id" PRIMARY KEY ("id")
          );
          ALTER TABLE "employee_warning" ADD CONSTRAINT "fk_employee_id_employee_warning_id" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
          ALTER TABLE "employee_warning" ADD CONSTRAINT "fk_warning_id_employee_warning_id" FOREIGN KEY ("warning_type_id") REFERENCES "warning_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
          `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_warning" DROP CONSTRAINT "fk_warning_id_employee_warning_id";
        ALTER TABLE "employee_warning" DROP CONSTRAINT "fk_employee_id_employee_warning_id";
        DROP TABLE "employee_warning";
        `
    );
  }
}
