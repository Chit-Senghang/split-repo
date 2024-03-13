import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAuthenticationModule1684731934516
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE media (
            id serial4 NOT NULL,
            "version" int4 NOT NULL DEFAULT 0,
            entity_type varchar(100) NOT NULL,
            mime_type varchar(100) NOT NULL,
            "name" varchar NOT NULL,
            filename varchar NOT NULL,
            description varchar NULL,
            entity_id int4 NOT NULL,
            "size" int4 NOT NULL,
            updated_by int4 NULL,
            updated_at timestamp NOT NULL DEFAULT now(),
            created_by int4 NULL,
            created_at timestamp NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            CONSTRAINT pk_media PRIMARY KEY (id)
        );
        
        CREATE TABLE approval_status (
            id serial4 NOT NULL,
            "version" int4 NOT NULL DEFAULT 0,
            approval_workflow_id int4 NOT NULL,
            request_workflow_type_id int4 NOT NULL,
            entity_id int4 NOT NULL,
            request_to_update_by int4 NULL,
            request_to_update_json text NULL,
            request_to_update_changes text NULL,
            first_approval_user_id int4 NULL,
            second_approval_user_id int4 NULL,
            status varchar(10) NOT NULL DEFAULT 'PENDING'::character varying,
            updated_by int4 NULL,
            updated_at timestamp NULL,
            created_by int4 NULL,
            created_at timestamp NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            acknowledge_user_id int4 NULL,
            acknowledge_date timestamptz NULL,
            first_approval_result bool NULL,
            first_approval_date timestamptz NULL,
            first_approval_reason varchar NULL,
            second_approval_result bool NULL,
            second_approval_reason varchar NULL,
            second_approval_date timestamptz NULL,
            CONSTRAINT pk_approval_status_id PRIMARY KEY (id)
        );
        
        CREATE TABLE reason_template (
            id serial4 NOT NULL,
            "version" int4 NOT NULL DEFAULT 0,
            "type" varchar(100) NOT NULL,
            "name" varchar NOT NULL,
            updated_by int4 NULL,
            updated_at timestamp NOT NULL DEFAULT now(),
            created_by int4 NULL,
            created_at timestamp NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            CONSTRAINT pk_reason_template PRIMARY KEY (id)
        );

        CREATE UNIQUE INDEX uk_reason_template ON reason_template USING btree (name) WHERE (deleted_at IS NULL);
        
        CREATE TABLE request_approval_workflow (
            id serial4 NOT NULL,
            "version" int4 NOT NULL DEFAULT 0,
            request_workflow_type_id int4 NOT NULL,
            description varchar NULL,
            "enable" bool NOT NULL DEFAULT true,
            updated_by int4 NULL,
            updated_at timestamp NOT NULL DEFAULT now(),
            created_by int4 NULL,
            created_at timestamp NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            CONSTRAINT pk_request_approval_workflow_id PRIMARY KEY (id)
        );
        
        CREATE TABLE request_approval_workflow_level (
            id serial4 NOT NULL,
            "version" int4 NOT NULL DEFAULT 0,
            request_approval_workflow_id int4 NOT NULL,
            position_level_id int4 NOT NULL,
            company_structure_department_id int4 NULL,
            "type" varchar(100) NOT NULL,
            updated_by int4 NULL,
            updated_at timestamp NOT NULL DEFAULT now(),
            created_by int4 NULL,
            created_at timestamp NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            CONSTRAINT pk_request_approval_workflow_level_id PRIMARY KEY (id),
            CONSTRAINT fk_company_structure_department_id_company_structure_department_id FOREIGN KEY ("company_structure_department_id") REFERENCES "company_structure" (id),
            CONSTRAINT fk_position_level_id_position_level_id FOREIGN KEY ("position_level_id") REFERENCES "position_level" (id)
        );

        CREATE UNIQUE INDEX uk_request_approval_workflow_level_position_level ON request_approval_workflow_level USING btree (request_approval_workflow_id, position_level_id, company_structure_department_id, type);
        
        CREATE TABLE request_work_flow_type (
            id serial4 NOT NULL,
            "version" int4 NOT NULL DEFAULT 0,
            request_type varchar(100) NULL,
            description varchar(255) NULL,
            updated_by int4 NULL,
            created_by int4 NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            deleted_at timestamptz NULL,
            CONSTRAINT pk_request_work_flow_type_id PRIMARY KEY (id)
        );

        CREATE UNIQUE INDEX uk_request_work_flow_type_request_type ON request_work_flow_type USING btree (request_type) WHERE (deleted_at IS NULL);
        ALTER TABLE request_approval_workflow ADD CONSTRAINT fk_request_approval_workflow_id_request_workflow_type_id FOREIGN KEY (request_workflow_type_id) REFERENCES request_work_flow_type(id);
        ALTER TABLE request_approval_workflow_level ADD CONSTRAINT fk_request_approval_workflow_level_id_request_approval_workflow FOREIGN KEY (request_approval_workflow_id) REFERENCES request_approval_workflow(id);
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
