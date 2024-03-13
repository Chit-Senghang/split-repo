import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPortToFingerprintDevice1691132402456
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE fingerprint_device ADD COLUMN port INTEGER NOT NULL DEFAULT('4373')`
    );
  }

  async down(): Promise<void> {
    return;
  }
}
