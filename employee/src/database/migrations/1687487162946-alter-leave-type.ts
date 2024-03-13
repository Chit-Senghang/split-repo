import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterLeaveType1687487162946 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table leave_type_variation
        rename "employee_type" to "employment_type";
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
