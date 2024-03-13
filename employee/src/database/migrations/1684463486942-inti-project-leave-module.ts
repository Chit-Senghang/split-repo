import { MigrationInterface, QueryRunner } from 'typeorm';

export class IntiProjectLeaveModule1684463486942 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE day_off_request (
            id serial4 NOT NULL,
            "version" int4 NOT NULL DEFAULT 0,
            employee_id int4 NOT NULL,
            day_off_date timestamptz NOT NULL,
            status varchar(10) NOT NULL DEFAULT 'PENDING'::character varying,
            updated_by int4 NULL,
            created_by int4 NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            CONSTRAINT pk_day_off_request PRIMARY KEY (id),
            CONSTRAINT fk_employee_id_employee_id FOREIGN KEY ("employee_id") REFERENCES "employee"(id) ON DELETE NO ACTION ON UPDATE NO ACTION
        );
        CREATE UNIQUE INDEX uk_employee_id_iday_off_date ON day_off_request USING btree (employee_id, day_off_date) WHERE (deleted_at IS NULL);

        CREATE TABLE leave_request_type (
            id serial4 NOT NULL,
            "version" int4 NOT NULL DEFAULT 0,
            "name" varchar(255) NOT NULL,
            description varchar NULL,
            updated_by int4 NULL,
            created_by int4 NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            CONSTRAINT pk_leave_request_type_id PRIMARY KEY (id)
        );
        CREATE UNIQUE INDEX uk_leave_request_type_name ON leave_request_type USING btree (name) WHERE (deleted_at IS NULL);

        CREATE TABLE mission_request (
            id serial4 NOT NULL,
            "version" int4 NULL DEFAULT 0,
            employee_id int4 NOT NULL,
            duration_type varchar(20) NOT NULL,
            from_date date NOT NULL,
            to_date date NOT NULL,
            reason varchar(255) NULL,
            status varchar(10) NOT NULL DEFAULT 'PENDING'::character varying,
            updated_by int4 NULL,
            created_by int4 NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            CONSTRAINT pk_mission_request_id PRIMARY KEY (id),
            CONSTRAINT fk_employee_id_employee_id FOREIGN KEY ("employee_id") REFERENCES "employee"(id) ON DELETE NO ACTION ON UPDATE NO ACTION
        );
        CREATE UNIQUE INDEX uk_employee_id_duration_type_from_date_to_date_mission_request ON mission_request USING btree (employee_id, duration_type, from_date, to_date) WHERE (deleted_at IS NULL);

        CREATE TABLE leave_request (
            id serial4 NOT NULL,
            "version" int4 NULL DEFAULT 0,
            leave_request_type_id int4 NOT NULL,
            employee_id int4 NOT NULL,
            duration_type varchar(20) NOT NULL,
            from_date date NOT NULL,
            to_date date NOT NULL,
            reason varchar(255) NULL,
            status varchar(10) NOT NULL DEFAULT 'PENDING'::character varying,
            updated_by int4 NULL,
            created_by int4 NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            CONSTRAINT pk_leave_request_id PRIMARY KEY (id),
            CONSTRAINT fk_leave_request_leave_request_type_id FOREIGN KEY (leave_request_type_id) REFERENCES leave_request_type(id),
            CONSTRAINT fk_employee_id_employee_id FOREIGN KEY ("employee_id") REFERENCES "employee"(id) ON DELETE NO ACTION ON UPDATE NO ACTION
        );
        CREATE UNIQUE INDEX uk_leave_request ON leave_request USING btree (employee_id, leave_request_type_id, duration_type, from_date, from_date) WHERE ((deleted_at IS NULL) AND ((status)::text = 'ACTIVE'::text));`);
  }

  async down(): Promise<void> {
    return;
  }
}
