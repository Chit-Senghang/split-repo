import { MigrationInterface, QueryRunner } from 'typeorm';

export class modifyFingerprint1682685462578 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "employee" 
        ALTER COLUMN "finger_print_id" TYPE VARCHAR;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
