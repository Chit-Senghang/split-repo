import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGenderRelationshipToEmployee1687251876609
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE employee
        ADD COLUMN gender_id INTEGER NULL;

        UPDATE employee
        SET gender_id = (SELECT id FROM code_value WHERE value = 'Male')
        WHERE gender ILIKE '%male%';

        UPDATE employee
        SET gender_id = (SELECT id FROM code_value WHERE value = 'Female')
        WHERE gender ILIKE '%female%';

        ALTER TABLE employee
        ALTER COLUMN gender_id SET NOT NULL;
        
        ALTER TABLE employee
        ADD CONSTRAINT fk_gender_id_code_value_id FOREIGN KEY (gender_id) REFERENCES code_value(id);
        
        ALTER TABLE employee
        DROP COLUMN gender;
    `);

    await queryRunner.query(`
        ALTER TABLE employee
        ADD COLUMN marital_status_id INTEGER NULL;

        UPDATE employee
        SET marital_status_id = (SELECT id FROM code_value WHERE value = 'Divorced')
        WHERE marital_status ILIKE '%divorced%';

        UPDATE employee
        SET marital_status_id = (SELECT id FROM code_value WHERE value = 'Married')
        WHERE marital_status ILIKE '%married%';

        UPDATE employee
        SET marital_status_id = (SELECT id FROM code_value WHERE value = 'Single')
        WHERE marital_status ILIKE '%single%';

        ALTER TABLE employee
        ALTER COLUMN marital_status_id SET NOT NULL;

        ALTER TABLE employee
        DROP COLUMN marital_status;

        ALTER TABLE employee
        ADD CONSTRAINT fk_marital_status_id_code_value_id FOREIGN KEY (marital_status_id) REFERENCES code_value(id);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
