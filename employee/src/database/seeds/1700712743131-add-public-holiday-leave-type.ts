import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublicHolidayLeaveType1700712743131
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        INSERT INTO leave_type
        ("version", leave_type_name,leave_type_name_kh, increment_rule, increment_allowance, carry_forward_status, carry_forward_allowance, required_doc,is_public_holiday, priority)
        VALUES(0, 'Public Holiday Leave','ការឈប់សម្រាកថ្ងៃបុណ្យ', 0, 0, true,0, 0,true, (SELECT priority FROM leave_type ORDER BY priority DESC LIMIT 1) + 1) ON CONFLICT DO NOTHING;

        INSERT INTO leave_type_variation("version", leave_type_id, employment_type, employee_status, gender_id, allowance_per_year, benefit_allowance_day, benefit_allowance_percentage) 
        VALUES(0, (SELECt id FROM leave_type WHERE leave_type_name = 'Public Holiday Leave'), null, null, null, 0, 0, 0);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
