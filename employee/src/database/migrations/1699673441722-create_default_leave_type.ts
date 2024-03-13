/* eslint-disable no-irregular-whitespace */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDefaultLeaveType1699673441722 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        DO $$
        BEGIN
        
            IF NOT EXISTS (SELECT * FROM leave_type WHERE leave_type_name = 'Annual Leave') THEN
                INSERT INTO leave_type
                ("version", leave_type_name,leave_type_name_kh, increment_rule, increment_allowance, carry_forward_status, carry_forward_allowance, required_doc)
                VALUES(0, 'Annual Leave','ការឈប់សម្រាកប្រចាំឆ្នាំ', 3, 1, true,6, 0);
                
                INSERT INTO leave_type_variation("version", leave_type_id, employment_type, employee_status, gender_id, prorate_per_month, special_leave_allowance_day, allowance_per_year, benefit_allowance_day, benefit_allowance_percentage) 
                VALUES(0, (SELECt id FROM leave_type WHERE leave_type_name = 'Annual Leave'), 'FULL_TIME', 'ACTIVE', null, 1.5, 7, 18, 18, 100);
                
                INSERT INTO leave_type_variation("version", leave_type_id, employment_type, employee_status, gender_id, prorate_per_month, special_leave_allowance_day, allowance_per_year, benefit_allowance_day, benefit_allowance_percentage) 
                VALUES(0, (SELECt id FROM leave_type WHERE leave_type_name = 'Annual Leave'), 'PART_TIME', 'ACTIVE', null, 0.75, 0, 9, 9, 100);
        END IF;
        
        IF NOT EXISTS (SELECT * FROM leave_type WHERE leave_type_name = 'Sick Leave') THEN
                INSERT INTO leave_type
                ("version", leave_type_name,leave_type_name_kh, required_doc)
                VALUES(0, 'Sick Leave','ឈប់​សម្រាក​ដោយ​សារ​ជម្ងឺ', 3);
                
                INSERT INTO leave_type_variation("version", leave_type_id, employment_type, employee_status, gender_id, allowance_per_year, benefit_allowance_day, benefit_allowance_percentage) 
                VALUES(0, (SELECt id FROM leave_type WHERE leave_type_name = 'Sick Leave'), 'FULL_TIME', 'ACTIVE', null, 7, 7, 100);
        END IF;
        
        IF NOT EXISTS (SELECT * FROM leave_type WHERE leave_type_name = 'Medical Leave') THEN
                INSERT INTO leave_type
                ("version", leave_type_name,leave_type_name_kh, required_doc)
                VALUES(0, 'Medical Leave','ការឈប់សម្រាកពេទ្យ', 1);
                
                INSERT INTO leave_type_variation("version", leave_type_id, employment_type, employee_status, gender_id, allowance_per_year, benefit_allowance_day, benefit_allowance_percentage) 
                VALUES(0, (SELECt id FROM leave_type WHERE leave_type_name = 'Medical Leave'), 'FULL_TIME', 'ACTIVE', null, 180, 90, 50);
        END IF;
        
        IF NOT EXISTS (SELECT * FROM leave_type WHERE leave_type_name = 'Maternity Leave') THEN
                INSERT INTO leave_type
                ("version", leave_type_name,leave_type_name_kh)
                VALUES(0, 'Maternity Leave','ការ​សម្រាក​ពេល​សម្រាល​កូន');
                
                INSERT INTO leave_type_variation("version", leave_type_id, employment_type, employee_status, gender_id, allowance_per_year, benefit_allowance_day, benefit_allowance_percentage) 
                VALUES(0, (SELECt id FROM leave_type WHERE leave_type_name = 'Maternity Leave'), 'FULL_TIME', 'ACTIVE', (SELECt id FROM code_value cv WHERE cv.code_id = (SELECt c.id FROM code c WHERE c.code = 'GENDER') and cv.value = 'Female'), 90, 90, 50);
        END IF;
        
        IF NOT EXISTS (SELECT * FROM leave_type WHERE leave_type_name = 'Unpaid Leave') THEN
                INSERT INTO leave_type
                ("version", leave_type_name,leave_type_name_kh)
                VALUES(0, 'Unpaid Leave','ការឈប់សម្រាកដែលមិនបង់ប្រាក់');
                
                INSERT INTO leave_type_variation("version", leave_type_id, employment_type, employee_status, gender_id, allowance_per_year, benefit_allowance_day, benefit_allowance_percentage) 
                VALUES(0, (SELECt id FROM leave_type WHERE leave_type_name = 'Unpaid Leave'), null, null, null, 180, 180, 0);
        END IF;
        
        END;
        $$;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
