import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnToCodeValue1692004664445 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE code_value
        ADD COLUMN value_in_khmer VARCHAR(255);
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
