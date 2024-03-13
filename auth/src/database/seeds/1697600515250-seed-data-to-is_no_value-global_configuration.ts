import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDataToIsNoValueGlobalConfiguration1697600515250
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE "global_configuration" SET "is_no_value" = true
            WHERE "name" IN (
                'email-notification',
                'enable-employee-warning-reset-by-month',
                'enable-employee-warning-reset-by-year',
                'real-time-notification'
            )
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
