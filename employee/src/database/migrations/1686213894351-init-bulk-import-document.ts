import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitBulkImportDocument1686213894351 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE bulk_import_document (
            id SERIAL4 NOT NULL,
            version INT4 NOT NULL DEFAULT 0,
            type VARCHAR(20) NOT NULL,
            import_end_time TIMESTAMPTZ NULL,
            is_completed BOOLEAN NOT NULL DEFAULT(false),
            total_record INT4 NOT NULL DEFAULT(0),
            success_count INT4 NOT NULL DEFAULT(0),
            failure_count INT4 NOT NULL DEFAULT(0),
            updated_by INT4 NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT now(),
            created_by INT4 NULL,
            created_at TIMESTAMP NOT NULL DEFAULT now(),
            deleted_at TIMESTAMPTZ NULL,
            CONSTRAINT pk_bulk_import_document PRIMARY KEY (id)
        );
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE "bulk_import_document";
    `);
  }
}
