import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGlobalConfiguration1690273302776
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO global_configuration (version, name, is_enable, value, type)
        VALUES (1, 'round-amount', true, 1, 'PAYROLL');
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
