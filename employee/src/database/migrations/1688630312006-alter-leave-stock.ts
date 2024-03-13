import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterLeaveStock1688630312006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table leave_stock
        add column carry_forward_expiry_date timestamp;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
