import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterTableInsuranceNameToInsurance1672132227162
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
       ALTER TABLE "insurance_name"
       RENAME TO "insurance";
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
