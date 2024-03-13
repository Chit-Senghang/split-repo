import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterEmployee1688181883987 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table employee 
        add column probation boolean default false;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
