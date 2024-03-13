import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTypeOfFromDateToDateOfMissionToDateTime1693970930002
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE mission_request
        ALTER COLUMN from_date TYPE timestamp,
        ALTER COLUMN to_date TYPE timestamp;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
