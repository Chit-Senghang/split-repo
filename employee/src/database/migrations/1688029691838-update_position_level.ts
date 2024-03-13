import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePositionLevel1688029691838 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
    INSERT INTO position_level (level_title, level_number) VALUES('OFFICER', 2.1) ON CONFLICT DO NOTHING;
    UPDATE position_level SET level_title = 'SENIOR OFFICER', level_number=2.2 WHERE level_title = 'SENIOR OFFICER, OFFICER';
    
    INSERT INTO position_level (level_title, level_number) VALUES('DEPUTY MANAGER', 4.1) ON CONFLICT DO NOTHING;
    UPDATE position_level SET level_title = 'MANAGER', level_number=4.2 WHERE level_title = 'MANAGER, DEPUTY MANAGER';
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
