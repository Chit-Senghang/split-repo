import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropTableCompany1697611700996 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS company`);
  }

  public async down(): Promise<void> {
    return;
  }
}
