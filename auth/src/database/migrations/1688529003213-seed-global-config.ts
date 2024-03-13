import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGlobalConfig1688529003213 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        insert into global_configuration (name , value, is_enable, type)
        values ('payroll-generate-date', 25, true, 'PAYROLL' );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
