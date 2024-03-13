import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCountryCodeToEmployeeContact1693186604111
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE employee_contact
        ADD COLUMN country_code VARCHAR(10) NOT NULL DEFAULT(+855);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
