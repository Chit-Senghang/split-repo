import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateGlobalConfiguration1699526188309
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        UPDATE global_configuration SET 
        regex = '^.{1,20}$',
        message = 'Value must be between 1 - 20 characters' 
        WHERE name = 'employee-account-no-prefix';
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
