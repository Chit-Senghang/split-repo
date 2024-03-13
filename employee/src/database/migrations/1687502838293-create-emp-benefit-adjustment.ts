import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmpBenefitAdjustment1687502838293
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table payroll_benefit_adjustment (
            "id" SERIAL primary key,
            "adjustment_type" varchar (50),
            "adjustment_date" TIMESTAMP NOT NULL,
            "effective_date" TIMESTAMP NOT NULL,
            "reason" varchar(255),
            "status" varchar(50),
            "employee_id" integer,
            "version" INTEGER default 0,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP,
            constraint fk_employee_id foreign key (employee_id) references employee (id)
        );

        create table payroll_benefit_adjustment_detail (
            "id" SERIAL primary key,
            "payroll_benefit_adjustment_id" integer,
            "salary_component_id" integer,
            "adjust_amount" decimal,
            "version" INTEGER default 0,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP,
            constraint fk_salary_component foreign key (salary_component_id) references salary_component (id),
            constraint fk_payroll_benefit_adjustment_id foreign key (payroll_benefit_adjustment_id) references payroll_benefit_adjustment(id),
            constraint uk_payroll_adjustment_salary_component unique ("payroll_benefit_adjustment_id", "salary_component_id")
        );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
