import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueWithEmailAndContact1689669106506
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE employee_contact
        ADD CONSTRAINT "uk_employee_contact_contact" UNIQUE ("contact");
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
