import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateLeaveType1687320449226 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table leave_type
        add constraint uk_leave_type_name unique ("leave_type_name");

        alter table leave_type_variation 
        add column "genderId" integer,
        add constraint uk_leave_id_gender_emp_type_emp_status unique ("leave_type_id", "genderId", "employee_type", "employee_status"),
        add constraint fk_code_value_id foreign key ("genderId") references code_value("id"),
        drop column "gender";
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
