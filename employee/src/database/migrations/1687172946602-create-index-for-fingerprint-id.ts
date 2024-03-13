import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIndexForFingerprintId1687172946602
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE INDEX fingerprint_hash_index
        ON attendance_record (finger_print_id);

        CREATE INDEX fingerprint_emp_hash_index
        ON employee (finger_print_id);
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
