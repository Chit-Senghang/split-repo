import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnToAttendanceReport1685693111344
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(` 
        alter table attendance_report 
        add column "ot_duration" integer default null;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
