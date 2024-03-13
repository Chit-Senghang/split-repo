import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedExchangeRate1692001458105 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO global_configuration (name, is_enable, value, type)
        values ('exchange_rate', true, 4100, 'PAYROLL'), ('exchange_rate_nssf', true, 4100, 'PAYROLL');
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
