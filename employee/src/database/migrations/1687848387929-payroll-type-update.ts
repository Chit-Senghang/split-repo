import { MigrationInterface, QueryRunner } from 'typeorm';

export class PayrollTypeUpdate1687848387929 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table adjustment_type
        add constraint uk_name unique ("name");
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
