import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmployeeRelationshipToApprovalStatus1696686665344
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE approval_status
        ADD COLUMN employee_id INT NULL;
    `);

    const approvalStatuses = await queryRunner.query(
      'SELECT * FROM approval_status_view'
    );

    if (approvalStatuses.length) {
      for (const approvalStatus of approvalStatuses) {
        await queryRunner.query(
          ` UPDATE approval_status SET employee_id = ${approvalStatus['employee_id']}
            WHERE id = ${approvalStatus.id};
          `
        );
      }
    }

    await queryRunner.query(`
      ALTER TABLE approval_status
      ALTER COLUMN employee_id SET NOT NULL,
      ADD CONSTRAINT fk_employee_id_employee FOREIGN KEY(employee_id) REFERENCES employee (id);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
