import { MigrationInterface, QueryRunner } from 'typeorm';
import { DEFAULT_DATE_TIME_FORMAT } from './../../shared-resources/common/dto/default-date-format';

export class RemoveDuplicateAttendanceRecord1693306286185
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // remove attendance-record duplicates
    await queryRunner.manager.query(`
        DELETE FROM
        attendance_record a
        USING attendance_record b
        WHERE
        a.id > b.id
        AND TO_CHAR(a.scan_time, '${DEFAULT_DATE_TIME_FORMAT}') = TO_CHAR(b.scan_time, '${DEFAULT_DATE_TIME_FORMAT}')
        AND a.finger_print_id = b.finger_print_id
        AND a.company_structure_outlet_id = b.company_structure_outlet_id
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
