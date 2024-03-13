import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBodJobName1699505840361 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            UPDATE job_scheduler_log 
                SET "name"  = 'BEGINNING_OF_THE_DAY'
            WHERE "name" = 'Beginning of the day';
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
