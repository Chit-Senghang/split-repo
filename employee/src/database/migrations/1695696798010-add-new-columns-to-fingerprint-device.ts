import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnsToFingerprintDevice1695696798010
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE fingerprint_device
        ADD COLUMN last_retrieved_date TIMESTAMP,
        ADD COLUMN last_retrieved_status VARCHAR(10);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
