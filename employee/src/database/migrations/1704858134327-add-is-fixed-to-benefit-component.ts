import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsFixedToBenefitComponent1704858134327
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(
      `ALTER TABLE "benefit_component" 
      ADD "is_fixed" boolean DEFAULT false`
    );

    await queryRunner.manager.query(`
        UPDATE benefit_component
            SET is_fixed = true
        WHERE 
            name = 'BASE SALARY'
    `);
  }

  public async down(): Promise<void> {}
}
