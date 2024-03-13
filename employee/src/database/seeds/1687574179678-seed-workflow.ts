import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedWorkflow1687574179678 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        insert into request_work_flow_type ("request_type", "description", "version")
        values ('PAYROLL_BENEFIT_ADJUSTMENT', 'payroll benefit adjustment', 1);
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
