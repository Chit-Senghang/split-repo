import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropTableEmployeeResignationReasonTemplate1694424508923
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE "employee_resignation_reason_template"`
    );
  }

  async down(): Promise<void> {
    return;
  }
}
