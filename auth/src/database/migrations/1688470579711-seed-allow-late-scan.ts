import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAllowLateScan1688470579711 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        insert into global_configuration (name, value, is_enable, is_system_defined)
        values ('allow_late_scan_in', 10, true, false), ('allow_late_scan_out', 10, true, false);
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
