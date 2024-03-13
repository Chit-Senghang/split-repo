import { MigrationInterface, QueryRunner } from 'typeorm';

export class functionForSeedCodeValue1672296826932
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DO $$
    DECLARE 
    return_code_id INT;
    BEGIN
    -- EMPLOYEE_CONTRACT_TYPE
        INSERT INTO code(code,value,is_system_defined) VALUES
        ('EMPLOYEE_CONTRACT_TYPE','', TRUE) RETURNING id into return_code_id;
        INSERT INTO code_value(value, code_id,is_system_defined) VALUES
        ('UDC-24', return_code_id, TRUE),
        ('UDC-26', return_code_id, TRUE);

    -- EMPLOYMENT_TYPE
    INSERT INTO code(code,value,is_system_defined) VALUES
    ('EMPLOYMENT_TYPE','', TRUE) RETURNING id into return_code_id;
    INSERT INTO code_value(value, code_id,is_system_defined) VALUES
    ('FULL TIME', return_code_id, TRUE),
    ('PART TIME', return_code_id, TRUE);

    -- EMPLOYEE_DOCUMENT_TYPE
    INSERT INTO code(code,value,is_system_defined) VALUES
    ('EMPLOYEE_DOCUMENT_TYPE','', TRUE) RETURNING id into return_code_id;
    INSERT INTO code_value(value, code_id,is_system_defined) VALUES
    ('Khmer Identity Card', return_code_id, TRUE),
    ('Passport', return_code_id, TRUE),
    ('Driver Licence', return_code_id, TRUE);

    -- RELATIONSHIP
    INSERT INTO code(code,value,is_system_defined) VALUES
    ('RELATIONSHIP','', TRUE) RETURNING id into return_code_id;
    INSERT INTO code_value(value, code_id,is_system_defined) VALUES
    ('Wife', return_code_id, TRUE),
    ('Mother', return_code_id, TRUE),
    ('Father', return_code_id, TRUE);

    -- MARITAL_STATUS
    INSERT INTO code(code,value,is_system_defined) VALUES
    ('MARITAL_STATUS','', TRUE) RETURNING id into return_code_id;
    INSERT INTO code_value(value, code_id,is_system_defined) VALUES
    ('Single', return_code_id, TRUE),
    ('Divorce', return_code_id, TRUE),
    ('Marriage', return_code_id, TRUE);

    -- EDUCATION_TYPE
    INSERT INTO code(code,value,is_system_defined) VALUES
    ('EDUCATION_TYPE','', TRUE) RETURNING id into return_code_id;
    INSERT INTO code_value(value, code_id,is_system_defined) VALUES
    ('BACHELOR DEGREE', return_code_id, TRUE),
    ('MASTER DEGREE', return_code_id, TRUE),
    ('PHD', return_code_id, TRUE);

    -- LANGUAGE
    INSERT INTO code(code,value,is_system_defined) VALUES
    ('LANGUAGE','', TRUE) RETURNING id into return_code_id;
    INSERT INTO code_value(value, code_id,is_system_defined) VALUES
    ('Khmer', return_code_id, TRUE),
    ('Thai', return_code_id, TRUE);

    -- EMPLOYEE_TRAINING
    INSERT INTO code(code,value,is_system_defined) VALUES
    ('EMPLOYEE_TRAINING','', TRUE) RETURNING id into return_code_id;
    INSERT INTO code_value(value, code_id,is_system_defined) VALUES
    ('Ms Office Trainning', return_code_id, TRUE);

    -- EMPLOYEE_SKILL
    INSERT INTO code(code,value,is_system_defined) VALUES
    ('EMPLOYEE_SKILL','', TRUE) RETURNING id into return_code_id;
    INSERT INTO code_value(value, code_id,is_system_defined) VALUES
    ('Graphic Design', return_code_id, TRUE);

    -- EMPLOYEE_REASON_TEMPLATE
    INSERT INTO code(code,value,is_system_defined) VALUES
    ('EMPLOYEE_REASON_TEMPLATE','', TRUE) RETURNING id into return_code_id;
    INSERT INTO code_value(value, code_id,is_system_defined) VALUES
    ('I HAVE CHANGED MY STUDY SCHEDULE', return_code_id, FALSE),
    ('I HAVE MOVE TO ANOTHER LOCATION', return_code_id, FALSE);

    -- EMPLOYEE_RESIGNATION_TYPE
    INSERT INTO code(code,value,is_system_defined) VALUES
    ('EMPLOYEE_RESIGNATION_TYPE','', TRUE) RETURNING id into return_code_id;
    INSERT INTO code_value(value, code_id,is_system_defined) VALUES
    ('RESIGNED', return_code_id, TRUE),
    ('TERMINATED', return_code_id, TRUE),
    ('WALK OUT', return_code_id, TRUE);

    -- EMPLOYEE_WARNING_TYPE
    INSERT INTO code(code,value,is_system_defined) VALUES
    ('EMPLOYEE_WARNING_TYPE','', TRUE) RETURNING id into return_code_id;
    INSERT INTO code_value(value, code_id,is_system_defined) VALUES
    ('VERBAL', return_code_id, TRUE),
    ('WRITTEN', return_code_id, TRUE);
    END;
    $$;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
