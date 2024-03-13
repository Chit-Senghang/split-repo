import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedBankNamePermission1671095386094 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` INSERT INTO "permission" (id, "version", "name", mpath, parent_id, updated_by, created_by, created_at, updated_at, deleted_at) 
              VALUES(161, 2, 'BANK_NAME', '107.161.', 107, NULL, NULL, 'NOW()', 'NOW()', NULL),
              (162, 2, 'READ_BANK_NAME', '107.161.162.', 161, NULL, NULL, 'NOW()', 'NOW()', NULL),
              (163, 2, 'CREATE_BANK_NAME', '107.161.163.', 161, NULL, NULL, 'NOW()', 'NOW()', NULL),
              (164, 2, 'UPDATE_BANK_NAME', '107.161.164.', 161, NULL, NULL, 'NOW()', 'NOW()', NULL),
              (165, 2, 'DELETE_BANK_NAME', '107.161.165.', 161, NULL, NULL, 'NOW()', 'NOW()', NULL)
              `
    );
  }

  async down(): Promise<void> {
    return;
  }
}
