import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimeToMissionRequest1686121321150
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table mission_request 
        add column from_time time default '08:00:00',
        add column to_time time default '17:00:00';
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
