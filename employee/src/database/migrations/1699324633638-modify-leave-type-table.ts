import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyLeaveTypeTable1699324633638 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE leave_type
        DROP allowance_percent;
    `);

    await queryRunner.query(`
        ALTER TABLE leave_type_variation 
        ADD COLUMN benefit_allowance_day DECIMAL DEFAULT(0) NOT NULL,
        ADD COLUMN benefit_allowance_percentage DECIMAL DEFAULT(0) NOT NULL;
    `);

    await queryRunner.query(`
        ALTER TABLE leave_type_variation
        ADD COLUMN special_leave_allowance_day DECIMAL DEFAULT(0) NOT NULL;
    `);

    await queryRunner.query(`
        ALTER TABLE leave_type
        ADD COLUMN is_public_holiday BOOLEAN DEFAULT(false);
    `);

    //ADD UNIQUE CONSTRAINT TO LEAVE_TYPE_VARIATION
    await queryRunner.query(`
        CREATE UNIQUE INDEX uk_leave_type_id_employment_type_employee_status_gender_id 
        ON leave_type_variation(leave_type_id,employment_type,employee_status,gender_id)
        WHERE deleted_at IS NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
