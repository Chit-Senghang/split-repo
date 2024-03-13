import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetUniqueConstraintToEmployeeDefaultContact1693545106501
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    const employees = await queryRunner.query(`
        SELECT id from employee;
    `);

    if (employees.length) {
      for (const employee of employees) {
        const employeeContacts = await queryRunner.query(`
          SELECT * FROM employee_contact
          WHERE employee_id = ${employee.id}
        `);

        if (employeeContacts.length > 1) {
          //set all employee default contact to false when employee has two contact
          await queryRunner.query(`
            UPDATE employee_contact
            SET is_default = false
            WHERE employee_id = ${employee.id};
          `);

          //set one default contact back
          await queryRunner.query(`
            UPDATE employee_contact
            SET is_default = true
            WHERE id = ${employeeContacts[0].id}
          `);
        }
      }
    }

    await queryRunner.query(`
        CREATE UNIQUE INDEX uk_employee_id_is_default
        ON employee_contact (employee_id, is_default)
        WHERE is_default = true;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
