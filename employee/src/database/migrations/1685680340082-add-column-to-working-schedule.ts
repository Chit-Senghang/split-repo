import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnToWorkingSchedule1685680340082
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table working_shift
        add column "break_time" integer default 60,
        add column "work_on_weekend" boolean default false,
        add column "weekend_scan_time" TIMESTAMP default null;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
