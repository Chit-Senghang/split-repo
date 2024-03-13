import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlertPaymentMethod1689233860858 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table payment_method
        add column i_banking_report_format varchar(50);
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
