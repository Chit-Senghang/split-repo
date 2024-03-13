import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDuplicateDataInLeaveTypeAndStock1691381530725
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM leave_type_variation a
        USING leave_type_variation b
        WHERE a.id < b.id
        AND (a.leave_type_id = b.leave_type_id OR (a.leave_type_id IS NULL AND b.leave_type_id IS NULL))
        AND (a.employment_type = b.employment_type OR (a.employment_type IS NULL AND b.employment_type IS NULL))
        AND (a.employee_status = b.employee_status OR (a.employee_status IS NULL AND b.employee_status IS NULL))
        AND (a.gender_id = b.gender_id OR (a.gender_id IS NULL AND b.gender_id IS NULL));
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
