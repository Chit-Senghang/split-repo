import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterLeaveRequestV21687337411197 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table leave_request 
        drop constraint fk_leave_type_id,
        add constraint fk_leave_type_variation_id foreign key ("leave_type_id") references leave_type_variation ("id");
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
