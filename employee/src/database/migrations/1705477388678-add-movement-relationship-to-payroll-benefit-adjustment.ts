import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMovementRelationshipToPayrollBenefitAdjustment1705477388678
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE payroll_benefit_adjustment
        ADD COLUMN employee_movement_id INTEGER NULL,
        ADD CONSTRAINT fk_employee_movement_id_employee_movement_id FOREIGN KEY (employee_movement_id) REFERENCES employee_movement(id)
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
