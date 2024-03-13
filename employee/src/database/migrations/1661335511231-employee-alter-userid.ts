import { MigrationInterface, QueryRunner } from 'typeorm';

export class employeeInit1661335511231 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee" ALTER COLUMN "user_id" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee" ALTER COLUMN "user_id" SET NOT NULL`
    );
  }
}
