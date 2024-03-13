import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePayrollReport1687938904686 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table payroll_report (
            "id" serial primary key,
            "employee_id" integer,
            "benefit" decimal not null,
            "deduction" decimal not null,
            "basic_salary" decimal not null,
            "date" timestamp not null,
            "version" INTEGER default 0,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP,
            constraint fk_employee_id foreign key (employee_id) references employee (id),
            constraint uk_emp_date unique (date, employee_id)
        );

        create table payroll_report_detail (
            "id" serial primary key,
            "payroll_report_id" integer,
            "amount" decimal,
            "type" varchar(50),
            "type_id" integer,
            "version" INTEGER default 0,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP,
            constraint fk_payroll_report_id foreign key (payroll_report_id) references payroll_report (id)
        );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
