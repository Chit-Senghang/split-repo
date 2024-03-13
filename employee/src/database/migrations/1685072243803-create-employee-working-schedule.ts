import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmployeeWorkingSchedule1685072243803
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table employee_working_schedule (
            "id" SERIAL not null,
            "version" integer not null,
            "employee_id"  integer not null,
            "schedule_date" date not null,
            "start_working_time" time not null,
            "end_working_time" time not null,
            "updated_by" integer,
            "created_by" integer,
            "created_at" timestamp NOT NULL DEFAULT now(),
            "updated_at" timestamp NOT NULL DEFAULT now(),
            "deleted_at" timestamp,
            constraint "pk_employee_working_schedule_id" primary key ("id"),
            constraint "fk_employee_id" foreign key ("employee_id") references "employee"("id"),
            constraint "unique_month_id" unique ("employee_id", "schedule_date")
        );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
