import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateToUppercaseInTaxResponsible1698131229828
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE
        employee 
            SET
            tax_responsible  = UPPER(tax_responsible)
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
