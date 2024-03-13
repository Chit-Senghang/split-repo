import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNssfTable1688121268485 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE employee_nssf (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER,
            nssf_id VARCHAR(255),
            salary DECIMAL,
            salary_in_average DECIMAL,
            salary_with_tax DECIMAL,
            nssf_personal_accident_insurance DECIMAL,
            nssf_health_insurance DECIMAL,
            pension_fund_employee DECIMAL,
            pension_fund_company DECIMAL,
            total_nssf_paid DECIMAL,
            "version" INTEGER default 0,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP,
            CONSTRAINT fk_employee_id FOREIGN KEY (employee_id) REFERENCES employee (id)
            );
        `
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
