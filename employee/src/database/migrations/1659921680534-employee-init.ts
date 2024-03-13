import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeInit1659921680534 implements MigrationInterface {
  name = 'employeeInit1659921680534';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_movement" ADD "current_department_id" integer`
    );
    await queryRunner.query(`
    ALTER TABLE 
        "employee_movement" 
    ADD 
       CONSTRAINT "fk_current_department_company_structure_id" FOREIGN KEY 
       ("current_department_id") REFERENCES "company_structure"("id") ON
       DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_movement" DROP CONSTRAINT "fk_current_department_company_structure_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "employee_movement" DROP COLUMN "current_department_id"`
    );
  }
}
