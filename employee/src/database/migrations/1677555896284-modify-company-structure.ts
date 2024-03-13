import { MigrationInterface, QueryRunner } from 'typeorm';

export class modifyCompanyStructure1677555896284 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "company_structure"
        ALTER COLUMN "position_level_id" DROP NOT NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
