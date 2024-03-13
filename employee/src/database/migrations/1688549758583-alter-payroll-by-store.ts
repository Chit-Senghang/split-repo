import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterPayrollByStore1688549758583 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table payroll_by_store 
        add column store_id integer not null,
        add constraint fk_store_id foreign key (store_id) references company_structure (id);

        alter table payroll_master
        add constraint uk_date unique (date);
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
