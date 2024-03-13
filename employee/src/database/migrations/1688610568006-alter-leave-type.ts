import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterLeaveType1688610568006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table leave_type
        drop column required_doc,
        add column allowance_percent integer not null default 0;

        alter table leave_type
        add column required_doc integer;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
