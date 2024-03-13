import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterTableAddColumnWorkingShift1675046399633
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "working_shift" ADD "start_scan_time_part_one" TIME NULL;
        ALTER TABLE "working_shift" ADD "end_scan_time_part_one" TIME NULL;
        ALTER TABLE "working_shift" ADD "start_scan_time_part_two" TIME NULL;
        ALTER TABLE "working_shift" ADD "end_scan_time_part_two" TIME NULL;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
