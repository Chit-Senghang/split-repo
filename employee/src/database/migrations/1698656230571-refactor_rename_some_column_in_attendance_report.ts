import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorRenameSomeColumnInAttendanceReport1698656230571
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE attendance_report RENAME COLUMN start_scan_part_one TO check_in;
            ALTER TABLE attendance_report RENAME COLUMN end_scan_part_one TO break_in;
            ALTER TABLE attendance_report RENAME COLUMN start_scan_part_two TO break_out;
            ALTER TABLE attendance_report RENAME COLUMN end_scan_part_two TO check_out;
            ALTER TABLE attendance_report RENAME COLUMN late_scan_part_one TO late_check_in;
            ALTER TABLE attendance_report RENAME COLUMN late_scan_part_two TO break_in_early;
            ALTER TABLE attendance_report RENAME COLUMN late_scan_part_three TO late_break_out;
            ALTER TABLE attendance_report RENAME COLUMN late_scan_part_four TO check_out_early;
        `);
  }

  async down(): Promise<void> {
    return;
  }
}
