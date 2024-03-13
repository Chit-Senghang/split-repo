import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBonusPercentageColumnToPublicHoliday1703489759413
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.manager.query(`
        ALTER TABLE public_holiday ADD COLUMN bonus_percentage DECIMAL(8,2);
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
