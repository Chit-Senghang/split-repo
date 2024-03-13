import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationshipOfReasonTemplateWorkflowTables1698892196392
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    // Add relationship to below table.
    await queryRunner.query(`
        ALTER TABLE employee_warning
        ADD COLUMN reason_template_id INTEGER NULL;
        ALTER TABLE employee_warning
        ADD CONSTRAINT fk_reason_template_id_reason_template FOREIGN KEY(reason_template_id) REFERENCES reason_template(id);

        ALTER TABLE employee_movement
        ADD COLUMN reason_template_id INTEGER NULL;
        ALTER TABLE employee_movement
        ADD CONSTRAINT fk_reason_template_id_reason_template FOREIGN KEY(reason_template_id) REFERENCES reason_template(id);

        ALTER TABLE employee_resignation
        ADD COLUMN reason_template_id INTEGER NULL;
        ALTER TABLE employee_resignation
        ADD CONSTRAINT fk_reason_template_id_reason_template FOREIGN KEY(reason_template_id) REFERENCES reason_template(id);

        ALTER TABLE missed_scan_request
        ADD COLUMN reason_template_id INTEGER NULL;
        ALTER TABLE missed_scan_request
        ADD CONSTRAINT fk_reason_template_id_reason_template FOREIGN KEY(reason_template_id) REFERENCES reason_template(id);

        ALTER TABLE mission_request
        ADD COLUMN reason_template_id INTEGER NULL;
        ALTER TABLE mission_request
        ADD CONSTRAINT fk_reason_template_id_reason_template FOREIGN KEY(reason_template_id) REFERENCES reason_template(id);

        ALTER TABLE overtime_request
        ADD COLUMN reason_template_id INTEGER NULL;
        ALTER TABLE overtime_request
        ADD CONSTRAINT fk_reason_template_id_reason_template FOREIGN KEY(reason_template_id) REFERENCES reason_template(id);

        ALTER TABLE leave_request
        ADD COLUMN reason_template_id INTEGER NULL;
        ALTER TABLE leave_request
        ADD CONSTRAINT fk_reason_template_id_reason_template FOREIGN KEY(reason_template_id) REFERENCES reason_template(id);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
