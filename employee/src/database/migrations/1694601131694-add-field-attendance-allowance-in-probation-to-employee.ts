import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldAttendanceAllowanceInProbationToEmployee1694601131694
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE employee
            ADD COLUMN attendance_allowance_in_probation BOOLEAN DEFAULT false;
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
