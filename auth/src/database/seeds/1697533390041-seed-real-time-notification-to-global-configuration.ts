import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRealTimeNotificationToGlobalConfiguration1697533390041
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
    INSERT INTO 
        global_configuration (
            version, 
            name, 
            is_enable, 
            description
        )
        VALUES
        ( 
            0, 
            'real-time-notification', 
            true,  
            'enable/disable real-time notification'
        );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
