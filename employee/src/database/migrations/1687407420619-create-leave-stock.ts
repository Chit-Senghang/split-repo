import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLeaveStock1687407420619 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table "leave_stock" (
            "id" SERIAL PRIMARY KEY,
            "leave_type_id" integer,
            "employee_id" integer,
            "leave_day" real,
            "carry_forward" real,
            "year" integer,
            "version" INTEGER default 0,
            "updated_by" integer,
            "created_by" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP,
            CONSTRAINT uk_emp_leave_type UNIQUE ("leave_type_id","employee_id", "year"),
            CONSTRAINT fk_leave_type_variation_id FOREIGN KEY (leave_type_id) REFERENCES leave_type_variation("id"),
            CONSTRAINT fk_employee_id FOREIGN KEY (employee_id) REFERENCES employee("id")
        );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
