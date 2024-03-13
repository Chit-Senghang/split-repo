import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnToOtp1689736660968 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE otp
        ADD COLUMN "is_verified" BOOLEAN DEFAULT(false);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
