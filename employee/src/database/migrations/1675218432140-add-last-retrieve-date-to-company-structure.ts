import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLastRetrieveDateToCompanyStructure1675218432140
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "company_structure"
        ADD COLUMN "last_retrieve_date" TIMESTAMPTZ NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
