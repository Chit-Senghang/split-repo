import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAttendanceReport1689868374697 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table attendance_report
        alter column payback_duration type integer,
        alter column mission_duration type integer;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
