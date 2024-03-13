import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAllowance1694658730535 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    const benefitComponentTypes = await queryRunner.query(
      ` SELECT * FROM benefit_component_type 
        WHERE name = 'ATTENDANCE ALLOWANCE'
        LIMIT 1;
      `
    );

    if (benefitComponentTypes?.length) {
      await queryRunner.query(`
            UPDATE benefit_component_type
            SET name = 'ALLOWANCE'
            WHERE id = ${benefitComponentTypes[0]?.id};
        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
