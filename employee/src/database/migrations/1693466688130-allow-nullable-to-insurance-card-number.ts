import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowNullableToInsuranceCardNumber1693466688130
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE employee_insurance
        ALTER COLUMN card_number DROP NOT NULL;

        ALTER TABLE employee_vaccination
        ALTER COLUMN card_number DROP NOT NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
