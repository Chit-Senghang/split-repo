import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnToAttendanceReport1686194083621
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "attendance_report" 
        ADD COLUMN "borrow" boolean DEFAULT false,
        ADD COLUMN "borrow_duration" integer DEFAULT 0;
      `);
  }

  public async down(): Promise<void> {
    return;
  }
}
