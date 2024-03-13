import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrimExistingEmployeeContact1693191856219
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    const employeeContacts = await queryRunner.query(`
        SELECT contact FROM employee_contact;
    `);

    if (employeeContacts.length) {
      for (const employeeContact of employeeContacts) {
        await queryRunner.query(`
            UPDATE employee_contact
            SET contact = '${employeeContact.contact.replace(/\s+/g, '')}'
            WHERE contact = '${employeeContact.contact}';
        `);
      }
    }
  }

  async down(): Promise<void> {
    return;
  }
}
