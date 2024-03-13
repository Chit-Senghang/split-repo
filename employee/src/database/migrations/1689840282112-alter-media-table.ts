import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMediaTable1689840282112 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE media
        ALTER COLUMN entity_type DROP NOT NULL,
        ALTER COLUMN entity_id DROP NOT NULL;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
