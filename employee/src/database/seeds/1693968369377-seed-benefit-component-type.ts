import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBenefitComponentType1693968369377
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO benefit_component_type (name, tax_percentage, is_system_defined)
        VALUES ('ATTENDANCE ALLOWANCE', 0, true );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
