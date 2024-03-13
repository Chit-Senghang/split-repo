import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFullNameToEmployee1677812499517 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "employee"
        ADD "display_full_name_kh" VARCHAR(50) NULL;
        ALTER TABLE "employee"
        ADD "display_full_name_en" VARCHAR(50) NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
