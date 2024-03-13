import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableSeniority1688187288724 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table seniority 
        drop column taxable_amount_riel,
        add column exchange_rate decimal;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
