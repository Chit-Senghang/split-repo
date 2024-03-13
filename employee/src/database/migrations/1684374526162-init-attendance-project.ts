import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAttendanceProject1684374526162 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE borrow_or_payback_request (
            id serial4 NOT NULL,
            "version" int4 NOT NULL DEFAULT 0,
            employee_id int4 NOT NULL,
            request_date timestamptz NOT NULL,
            start_time time NOT NULL,
            end_time time NOT NULL,
            "type" varchar(10) NOT NULL,
            payback_for_request_id int4 NULL,
            reason varchar(255) NULL,
            status varchar(10) NOT NULL DEFAULT 'PENDING'::character varying,
            updated_by int4 NULL,
            created_by int4 NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            CONSTRAINT pk_borrow_or_payback_request_id PRIMARY KEY (id),
            CONSTRAINT fk_payback_for_request_id_id_borrow_or_payback_request FOREIGN KEY (payback_for_request_id) REFERENCES borrow_or_payback_request(id),
            CONSTRAINT fk_employee_id_employee_id FOREIGN KEY ("employee_id") REFERENCES "employee"(id) ON DELETE NO ACTION ON UPDATE NO ACTION
        );

        CREATE TABLE attendance_record (
            id serial4 NOT NULL,
            "version" int4 NULL DEFAULT 0,
            finger_print_id varchar(255) NOT NULL,
            "employee_id" int4 NOT NULL,
            scan_time timestamptz NOT NULL,
            company_structure_outlet_id int4 NOT NULL,
            updated_by int4 NULL,
            created_by int4 NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            CONSTRAINT pk_attendance_record_id PRIMARY KEY (id),
            CONSTRAINT fk_employee_id_employee_id FOREIGN KEY ("employee_id") REFERENCES "employee"(id) ON DELETE NO ACTION ON UPDATE NO ACTION
        );

        CREATE TABLE overtime_request_type (
            id serial4 NOT NULL,
            "version" int4 NULL DEFAULT 0,
            "name" varchar(255) NOT NULL,
            percentage_per_hour numeric NOT NULL DEFAULT 0,
            description varchar(255) NULL,
            updated_by int4 NULL,
            created_by int4 NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            CONSTRAINT pk_overtime_request_type_id PRIMARY KEY (id)
        );
        CREATE UNIQUE INDEX uk_overtime_request_type_name ON overtime_request_type USING btree (name) WHERE (deleted_at IS NULL);

        CREATE TABLE overtime_request (
            id serial4 NOT NULL,
            "version" int4 NOT NULL DEFAULT 0,
            employee_id int4 NOT NULL,
            request_date date NOT NULL,
            start_time time NOT NULL,
            end_time time NOT NULL,
            overtime_type_id int4 NOT NULL,
            reason varchar(255) NULL,
            status varchar(10) NOT NULL DEFAULT 'PENDING'::character varying,
            updated_by int4 NULL,
            created_by int4 NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            CONSTRAINT pk_overtime_request_id PRIMARY KEY (id),
            CONSTRAINT fk_employee_id_employee_id FOREIGN KEY ("employee_id") REFERENCES "employee"(id) ON DELETE NO ACTION ON UPDATE NO ACTION
        );
        
        ALTER TABLE overtime_request ADD CONSTRAINT fk_overtime_type_id_overtime_request_id FOREIGN KEY (overtime_type_id) REFERENCES overtime_request_type(id);

        CREATE TABLE missed_scan_request (
            id serial4 NOT NULL,
            "version" int4 NOT NULL DEFAULT 0,
            employee_id int4 NOT NULL,
            start_scan_time_part_one bool NOT NULL DEFAULT false,
            end_scan_time_part_one bool NOT NULL DEFAULT false,
            start_scan_time_part_two bool NOT NULL DEFAULT false,
            end_scan_time_part_two bool NOT NULL DEFAULT false,
            request_date timestamptz NOT NULL,
            reason varchar(255) NULL,
            status varchar(10) NULL,
            updated_by int4 NULL,
            created_by int4 NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            CONSTRAINT pk_missed_scan_request_id PRIMARY KEY (id),
            CONSTRAINT fk_employee_id_employee_id FOREIGN KEY ("employee_id") REFERENCES "employee"(id) ON DELETE NO ACTION ON UPDATE NO ACTION
        );

        CREATE TABLE public_holiday (
            id serial4 NOT NULL,
            "version" int4 NULL DEFAULT 0,
            "date" date NOT NULL,
            "name" varchar(255) NOT NULL,
            description varchar(255) NULL,
            updated_by int4 NULL,
            created_by int4 NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            CONSTRAINT pk_public_holiday_id PRIMARY KEY (id)
        );
        CREATE UNIQUE INDEX uk_public_holiday_name ON public_holiday USING btree (name) WHERE (deleted_at IS NULL);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
