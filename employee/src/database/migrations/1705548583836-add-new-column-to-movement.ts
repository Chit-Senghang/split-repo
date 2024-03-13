import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnToMovement1705548583836 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE employee_movement 
            ALTER COLUMN request_movement_employee_position_id DROP NOT NULL;

            ALTER TABLE employee_movement 
            ALTER COLUMN previous_employment_type TYPE VARCHAR(10);

            ALTER TABLE employee_movement 
            ADD COLUMN new_working_shift_id INTEGER NULL; 
            ALTER TABLE employee_movement 
            ADD CONSTRAINT fk_new_working_shift_id_working_shift_id 
            FOREIGN KEY(new_working_shift_id) REFERENCES working_shift(id);
            
            ALTER TABLE employee_movement 
            ADD COLUMN previous_working_shift_id INTEGER NULL; 
            ALTER TABLE employee_movement 
            ADD CONSTRAINT fk_previous_working_shift_id_working_shift_id 
            FOREIGN KEY(previous_working_shift_id) REFERENCES working_shift(id);
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
