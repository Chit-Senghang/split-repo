import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMissScanAndDayOff1684990520161 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          insert into global_configuration ("version","name",is_enable,is_system_defined,value)
          values (1, 'allow-miss-scan-time',true,false,5);
          
          insert into global_configuration ("version","name",is_enable,is_system_defined,value)
          values (1, 'allow-day-off-days',true,false,4);
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
