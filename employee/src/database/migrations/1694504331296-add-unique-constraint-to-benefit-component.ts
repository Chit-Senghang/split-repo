import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintToBenefitComponent1694504331296
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE benefit_component
        ADD CONSTRAINT uk_benefit_component_name UNIQUE(name);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
