import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUniqueContraintPublicHoliday1687700976732
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            DROP INDEX IF EXISTS uk_public_holiday_name;

            DELETE FROM public_holiday p1
            USING public_holiday AS p2
            WHERE p1.date = p2.date AND p1.id < p2.id;

            ALTER TABLE public_holiday 
                ADD CONSTRAINT "uk_public_holiday_date" UNIQUE ("date");
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
