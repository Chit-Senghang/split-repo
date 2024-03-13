import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameKhColumnToCompanyStructureComponent1692606118225
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE company_structure_component
      ADD COLUMN name_kh VARCHAR(255) NULL
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
