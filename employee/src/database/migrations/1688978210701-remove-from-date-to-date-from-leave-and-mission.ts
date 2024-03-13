import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveFromDateToDateFromLeaveAndMission1688978210701
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE mission_request
        DROP COLUMN from_time,
        DROP COLUMN to_time;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
