import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveGlobalConfig1698459490755 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        DELETE FROM global_configuration WHERE name = 'allow-late-scan-out';
        UPDATE global_configuration set name = 'allow-break-time-scan-after-check-in' where name = 'allow-second-scan-duration';
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
