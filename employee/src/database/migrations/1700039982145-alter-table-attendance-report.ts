import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableAttendanceReport1700039982145
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE attendance_report
        DROP COLUMN IF EXISTS ot,
        DROP COLUMN IF EXISTS mission,
        DROP COLUMN IF EXISTS day_off,
        DROP COLUMN IF EXISTS leave_id,
        DROP COLUMN IF EXISTS day_off_id,
        DROP COLUMN IF EXISTS mission_id,
        DROP COLUMN IF EXISTS overtime_id,
        DROP COLUMN IF EXISTS ot_duration,
        DROP COLUMN IF EXISTS absent,
        DROP COLUMN IF EXISTS leave_title,
        DROP COLUMN IF EXISTS status;

        ALTER TABLE attendance_report
        ADD COLUMN status VARCHAR(50) DEFAULT 'Absent',
        ADD COLUMN ot_duration VARCHAR(50),
        ADD COLUMN day_off_id INTEGER,
        ADD CONSTRAINT "fk_day_off_id" FOREIGN KEY ("day_off_id") REFERENCES "day_off_request"("id") ON DELETE SET NULL ON UPDATE SET NULL;

        ALTER TABLE mission_request
        DROP COLUMN IF EXISTS attendance_report_id;
        ALTER TABLE leave_request
        DROP COLUMN IF EXISTS attendance_report_id;
        ALTER TABLE overtime_request
        DROP COLUMN IF EXISTS attendance_report_id;

        CREATE TABLE attendance_report_mission_request (
          attendance_report_id INT NOT NULL,
          mission_request_id INT NOT NULL,
          PRIMARY KEY (attendance_report_id, mission_request_id),
          FOREIGN KEY (attendance_report_id) REFERENCES attendance_report(id) ON DELETE CASCADE,
          FOREIGN KEY (mission_request_id) REFERENCES mission_request(id)
        );
        
        CREATE TABLE attendance_report_leave_request (
          attendance_report_id INT NOT NULL,
          leave_request_id INT NOT NULL,
          PRIMARY KEY (attendance_report_id, leave_request_id),
          FOREIGN KEY (attendance_report_id) REFERENCES attendance_report(id) ON DELETE CASCADE,
          FOREIGN KEY (leave_request_id) REFERENCES leave_request(id)
        );
        
        CREATE TABLE attendance_report_overtime_request (
          attendance_report_id INT NOT NULL,
          overtime_request_id INT NOT NULL,
          PRIMARY KEY (attendance_report_id, overtime_request_id),
          FOREIGN KEY (attendance_report_id) REFERENCES attendance_report(id) ON DELETE CASCADE,
          FOREIGN KEY (overtime_request_id) REFERENCES overtime_request(id)
        );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
