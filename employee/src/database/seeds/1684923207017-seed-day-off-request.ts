import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDayOffRequest1684923207017 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "request_work_flow_type" 
        (
            "request_type",
            "description"
        )
        VALUES
        (
            'DAY_OFF_REQUEST',
            'day off request'
        )
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
