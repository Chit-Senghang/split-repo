import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableNssf1688128844655 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table employee_nssf
        add column date timestamp,
        add constraint uk_nssf_emp_date unique (employee_id, date);
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
