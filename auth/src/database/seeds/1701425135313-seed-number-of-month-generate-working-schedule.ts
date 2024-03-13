import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedNumberOfMonthGenerateWorkingSchedule1701425135313
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
      INSERT INTO 
          global_configuration (
            version, 
            name, 
            is_enable, 
            is_system_defined, 
            "value", 
            description,
            "type",
            data_type
          )
          VALUES
          ( 
            0, 
            'number-of-month-generate-working-schedule', 
            true, 
            false, 
            2, 
            'System will generate working scheduler for roster employee ahead # of month', 
            'ATTENDANCE',
            'NUMBER'
          );
      `);
  }

  public async down(): Promise<void> {
    return;
  }
}
