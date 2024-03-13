import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnToAttendanceReport1685860686595
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table attendance_report
        add column "leave" boolean default false;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
