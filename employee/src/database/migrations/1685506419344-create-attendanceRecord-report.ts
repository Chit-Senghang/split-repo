import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttendanceRecordReport1685506419344
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table attendance_report (
            "id" SERIAL NOT NULL,
            "version" integer not null,
            "employee_id" integer not null,
            "scan_type" integer,
            "date" TIMESTAMP ,
            "start_scan_part_one" TIMESTAMP,
            "end_scan_part_one" TIMESTAMP,
            "start_scan_part_two" TIMESTAMP,
            "end_scan_part_two" TIMESTAMP,
            "late_scan_part_one" integer,
            "late_scan_part_two" integer,
            "late_scan_part_three" integer,
            "late_scan_part_four" integer,
            "ot" boolean,
            "day_off" boolean,
            "absent" boolean,
            "working_hour" varchar(50),
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP,
            constraint "unique_attendance_employee" unique ("employee_id", "date"),
            constraint "pk_attendance_report" primary key ("id"),
            constraint "fk_employee_id" foreign key ("employee_id") references "employee"("id")
       )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
            drop table attendance_report;
        `
    );
  }
}
