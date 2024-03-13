import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyLeaveStockTable1700554707265 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM leave_stock;

        ALTER TABLE leave_stock
        DROP CONSTRAINT fk_leave_type_variation_id;

        ALTER TABLE leave_stock
        ADD CONSTRAINT fk_leave_type_id FOREIGN KEY (leave_type_id) REFERENCES leave_type(id);
    `);

    await queryRunner.query(`
        ALTER TABLE leave_stock
        ADD COLUMN policy_increment_rule DECIMAL NOT NULL DEFAULT(0),
        ADD COLUMN policy_increment_allowance DECIMAL NOT NULL DEFAULT(0),
        ADD COLUMN policy_carry_forward_status BOOLEAN NOT NULL DEFAULT(false),
        ADD COLUMN policy_carry_forward_allowance DECIMAL NOT NULL DEFAULT(0),
        ADD COLUMN policy_prorate_per_month DECIMAL NOT NULL DEFAULT(0),
        ADD COLUMN policy_allowance_per_year DECIMAL NOT NULL DEFAULT(0),
        ADD COLUMN policy_benefit_allowance_day DECIMAL NOT NULL DEFAULT(0),
        ADD COLUMN policy_benefit_allowance_percentage DECIMAL NOT NULL DEFAULT(0),
        ADD COLUMN policy_special_leave_allowance_day DECIMAL NOT NULL DEFAULT(0),
        ADD COLUMN special_leave_allowance_day DECIMAL NOT NULL DEFAULT(0),
        ADD COLUMN leave_day_top_up DECIMAL NOT NULL DEFAULT(0);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
