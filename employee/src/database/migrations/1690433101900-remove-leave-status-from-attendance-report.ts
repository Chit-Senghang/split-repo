import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLeaveStatusFromAttendanceReport1690433101900
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE attendance_report
            DROP COLUMN leave,
            DROP COLUMN leave_allowance,
            ADD COLUMN leave_id INTEGER,
            ADD CONSTRAINT fk_leave_id FOREIGN KEY (leave_id) REFERENCES leave_request(id);
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
