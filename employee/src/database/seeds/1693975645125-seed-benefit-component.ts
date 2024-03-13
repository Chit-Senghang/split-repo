import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBenefitComponent1693975645125 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(` 
        INSERT INTO benefit_component ("name", "salary_component_type_id", "is_system_defined", "name_khmer")
        VALUES ('ATTENDANCE ALLOWANCE', (SELECT id FROM benefit_component_type WHERE "name"='ATTENDANCE ALLOWANCE'), true, 'ប្រាក់ឧបត្ថមលើវត្តមាន');
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
