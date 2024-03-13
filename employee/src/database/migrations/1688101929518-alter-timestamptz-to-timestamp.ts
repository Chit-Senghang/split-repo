import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTimestamptzToTimestamp1688101929518
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
      -- approval_status 
      ALTER TABLE approval_status
      ALTER COLUMN deleted_at TYPE TIMESTAMP,
      ALTER COLUMN acknowledge_date TYPE TIMESTAMP,
      ALTER COLUMN first_approval_date TYPE TIMESTAMP,
      ALTER COLUMN second_approval_date TYPE TIMESTAMP;
      
      -- attendance_record 
      ALTER TABLE attendance_record
      ALTER COLUMN scan_time TYPE TIMESTAMP,
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- bank 
      ALTER TABLE bank
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- borrow_or_payback_request
      ALTER TABLE borrow_or_payback_request
      ALTER COLUMN request_date TYPE DATE,
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- bulk_import_document
      ALTER TABLE bulk_import_document
      ALTER COLUMN import_end_time TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP,
      ALTER COLUMN import_start_time TYPE TIMESTAMP;
      
      -- company
      ALTER TABLE company
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- company_structure
      ALTER TABLE company_structure
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP,
      ALTER COLUMN last_retrieve_date TYPE TIMESTAMP;
      
      -- company_structure_component
      ALTER TABLE company_structure_component
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- day_off_request
      ALTER TABLE day_off_request
      ALTER COLUMN day_off_date TYPE DATE,
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee
      ALTER TABLE employee
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP,
      ALTER COLUMN post_probation_date TYPE DATE,
      ALTER COLUMN resign_date TYPE DATE,
      ALTER COLUMN contract_period_start_date TYPE DATE,
      ALTER COLUMN contract_period_end_date TYPE DATE;
      
      -- employee_bank_account
      ALTER TABLE employee_bank_account
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee_contact
      ALTER TABLE employee_contact
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee_education
      ALTER TABLE employee_education
      ALTER COLUMN start_date TYPE DATE,
      ALTER COLUMN end_date TYPE DATE,
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee_emergency_contact
      ALTER TABLE employee_emergency_contact
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee_identifier
      ALTER TABLE employee_identifier
      ALTER COLUMN expire_date TYPE DATE,
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee_insurance
      ALTER TABLE employee_insurance
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee_language
      ALTER TABLE employee_language
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee_movement
      ALTER TABLE employee_movement
      ALTER COLUMN effective_date TYPE DATE,
      ALTER COLUMN last_movement_date TYPE DATE,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee_position
      ALTER TABLE employee_position
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee_post_probation_salary
      ALTER TABLE employee_post_probation_salary
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP;
      
      -- employee_resignation
      ALTER TABLE employee_resignation
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee_resignation_reason_template
      ALTER TABLE employee_resignation
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee_resignation_type
      ALTER TABLE employee_resignation_type
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee_skill
      ALTER TABLE employee_skill
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee_training
      ALTER TABLE employee_training
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee_vaccination
      ALTER TABLE employee_vaccination
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- employee_warning
      ALTER TABLE employee_warning
      ALTER COLUMN warning_date TYPE DATE;
      
      -- employee_working_schedule
      ALTER TABLE employee_working_schedule
      ALTER COLUMN schedule_date TYPE DATE;
      
      -- geographic
      ALTER TABLE geographic
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- insurance
      ALTER TABLE insurance
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- leave_request
      ALTER TABLE leave_request
      ALTER COLUMN from_date TYPE DATE,
      ALTER COLUMN to_date TYPE DATE,
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- leave_request_type
      ALTER TABLE leave_request_type
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- media
      ALTER TABLE media
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- missed_scan_request
      ALTER TABLE missed_scan_request
      ALTER COLUMN request_date TYPE DATE,
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- mission_request
      ALTER TABLE mission_request
      ALTER COLUMN from_date TYPE DATE,
      ALTER COLUMN to_date TYPE DATE,
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- overtime_request
      ALTER TABLE overtime_request
      ALTER COLUMN request_date TYPE DATE,
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- overtime_request_type
      ALTER TABLE overtime_request_type
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- payroll_benefit
      ALTER TABLE payroll_benefit
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP;
      
      -- payroll_deduction
      ALTER TABLE payroll_deduction
      ALTER COLUMN deduction_date TYPE DATE,
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP;
      
      -- position_level
      ALTER TABLE position_level
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- public_holiday
      ALTER TABLE public_holiday
      ALTER COLUMN date TYPE TIMESTAMP,
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP;
      
      -- reason_template
      ALTER TABLE reason_template
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- request_approval_workflow
      ALTER TABLE request_approval_workflow
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- request_approval_workflow_level
      ALTER TABLE request_approval_workflow_level
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- request_work_flow_type
      ALTER TABLE request_work_flow_type
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- salary_component
      ALTER TABLE salary_component
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP;
      
      -- salary_component_type
      ALTER TABLE salary_component_type
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP;
      
      -- vaccination
      ALTER TABLE vaccination
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- warning_type
      ALTER TABLE warning_type
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- working_shift
      ALTER TABLE working_shift
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
      
      -- workshift_type
      ALTER TABLE workshift_type
      ALTER COLUMN created_at TYPE TIMESTAMP,
      ALTER COLUMN updated_at TYPE TIMESTAMP,
      ALTER COLUMN deleted_at TYPE TIMESTAMP;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
