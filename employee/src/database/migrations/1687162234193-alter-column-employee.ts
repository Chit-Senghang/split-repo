import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterColumnEmployee1687162234193 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table employee
        alter column finger_print_id set not null;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
