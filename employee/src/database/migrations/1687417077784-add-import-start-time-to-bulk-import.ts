import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImportStartTimeToBulkImport1687417077784
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE bulk_import_document
        ADD COLUMN import_start_time TIMESTAMPTZ NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
