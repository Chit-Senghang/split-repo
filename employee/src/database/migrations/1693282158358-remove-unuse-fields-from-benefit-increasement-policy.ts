import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnuseFieldsFromBenefitIncreasementPolicy1693282158358
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE benefit_increasement_policy_detail
        DROP COLUMN is_monthly, 
        DROP COLUMN for_month, 
        DROP COLUMN for_year;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
