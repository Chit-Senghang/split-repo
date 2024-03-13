import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyIncreasementPolicyTable1689914618068
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE benefit_increasement_policy_detail
        ADD COLUMN  "for_year" INTEGER NULL, 
        ADD COLUMN "for_month" INTEGER NULL, 
        ADD COLUMN "is_monthly" BOOLEAN NOT NULL DEFAULT(false),
        ADD COLUMN "description" VARCHAR(255) NULL
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
