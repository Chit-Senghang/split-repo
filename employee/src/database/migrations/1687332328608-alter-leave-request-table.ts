import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterLeaveRequestTable1687332328608 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table leave_request
        drop column leave_request_type_id,
        add column leave_type_id integer,
        add constraint fk_leave_type_id foreign key ("leave_type_id") references leave_type ("id");
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
