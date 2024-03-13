import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyLevelNumber1685506194625 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            ALTER TABLE position_level ALTER COLUMN level_number TYPE numeric;
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
