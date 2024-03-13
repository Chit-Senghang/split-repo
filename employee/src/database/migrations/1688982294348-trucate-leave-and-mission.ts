import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrucateLeaveAndMission1688982294348 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        TRUNCATE TABLE leave_request, mission_request;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
