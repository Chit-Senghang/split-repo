import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLeaveType1687246318379 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table leave_type(
          id serial primary key,
          leave_type_name varchar(255) not null,
          increment_rule integer,
          increment_allowance  int,
          cover_from integer REFERENCES leave_type(id),
          required_doc varchar(255),
          carry_forward_status boolean default false,
          carry_forward_allowance integer,
          "version" INTEGER default 0,
          "updated_by" integer,
          "created_by" integer,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          "deleted_at" TIMESTAMP
        );

        create table leave_type_variation (
          id serial primary key,
          leave_type_id integer not null,
          gender varchar(50),
          employee_type varchar(50),
          employee_status varchar(50),
          prorate_per_month real,
          allowance_per_year real,
          "version" INTEGER default 0,
          "updated_by" integer,
          "created_by" integer,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          "deleted_at" TIMESTAMP,
          constraint fk_leave_type_id foreign key ("leave_type_id") references leave_type ("id")
        );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
