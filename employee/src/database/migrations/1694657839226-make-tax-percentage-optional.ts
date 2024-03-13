import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTaxPercentageOptional1694657839226
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE benefit_component_type
        ALTER COLUMN tax_percentage DROP NOT NULL,
        ALTER COLUMN tax_percentage SET DEFAULT 0;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
