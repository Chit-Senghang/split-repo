import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTwoColumnToEmloyeeMovement1686199307173
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "employee_position"
        ADD COLUMN "is_moved" BOOLEAN DEFAULT FALSE,
        ADD COLUMN "to_employee_position_id" INTEGER  NULL,
        ADD CONSTRAINT "pk_to_employee_position_id"
         FOREIGN KEY ("to_employee_position_id") REFERENCES "employee_position" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
