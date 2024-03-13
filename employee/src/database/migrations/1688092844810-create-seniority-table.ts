import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSeniorityTable1688092844810 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table seniority (
        "id" serial primary key,
        "employee_id" integer not null,
        "date" timestamp not null,
        "total" decimal not null,
        "total_round" decimal not null,
        "taxable_amount_dollar" decimal not null,
        "taxable_amount_dollar_round" decimal not null,
        "taxable_amount_riel" decimal not null,
        "average_total_salary" decimal not null,
        "prorate_per_day" decimal not null,
        "check" decimal,
        "version" INTEGER default 0,
        "updated_by" integer,
        "created_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        constraint fk_employee_id foreign key (employee_id) references employee (id)
    );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
