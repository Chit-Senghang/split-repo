import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewFlagToUserTable1688716647362 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT(true);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
