import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyAndConditionToMaterializedView1696254985983
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    //Just modify from EMPLOYEE_RESIGNATION to RESIGNATION_REQUEST in condition
    await queryRunner.query(`
        DROP MATERIALIZED VIEW IF EXISTS approval_status_view;
        CREATE MATERIALIZED VIEW approval_status_view AS
        SELECT approval.*, workflow.request_type,workflow.description,raw.id 
        AS request_approval_workflow_id,creator.id 
        AS user_id, creator.username, first_approver_user.username 
        AS first_approver_name, second_approver_user.username 
        AS second_approver_name, acknowledger_user.username
        AS acknowledger_name,
        e.display_full_name_en,
        e.display_full_name_kh,
        e.id AS employee_id,
        e.account_no AS employee_account_no,
        csc."name" AS location,
        csc2.name AS outlet, 
        csc3.name AS department, 
        csc4."name" AS team, 
        csc5.name AS position,
        cs.id AS location_id,
        cs2.id AS outlet_id,
        cs3.id AS department_id,
        cs4.id AS team_id,
        cs5.id  AS position_id,
        emp.display_full_name_en AS creator_employee_name,
        emp.display_full_name_kh AS creator_employee_name_kh,
        emp.id AS creator_employee_id,
        first_emp.id AS first_approver_employee_id,
        first_emp.display_full_name_en AS first_approver_employee_name,
        first_emp.display_full_name_kh AS first_approver_employee_name_kh,
        second_emp.id AS second_approver_employee_id,
        second_emp.display_full_name_en AS second_approver_employee_name,
        second_emp.display_full_name_kh AS second_approver_employee_name_kh,
        acknowledger_emp.id AS acknowledger_employee_id,
        acknowledger_emp.display_full_name_en AS acknowledger_employee_name,
        acknowledger_emp.display_full_name_kh AS acknowledger_employee_name_kh
        FROM approval_status approval 
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS creator 
        (
            id int,
            username text
        )
        ON creator.id = approval.created_by
        LEFT JOIN employee emp
        ON emp.user_id = creator.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS first_approver_user
        (
            id int,
            username text
        )
        ON first_approver_user.id = approval.first_approval_user_id
        LEFT JOIN employee first_emp
        ON first_emp.user_id = first_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS second_approver_user
        (
            id int,
            username text
        )
        ON second_approver_user.id = approval.second_approval_user_id
        LEFT JOIN employee second_emp
        ON second_emp.user_id = second_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS acknowledger_user
        (
            id int,
            username text
        )
        ON acknowledger_user.id = approval.acknowledge_user_id
        LEFT JOIN employee acknowledger_emp
        ON acknowledger_emp.user_id = acknowledger_user.id
        INNER JOIN request_work_flow_type workflow 
        ON approval.request_workflow_type_id = workflow.id
        INNER JOIN request_approval_workflow raw 
        ON approval.approval_workflow_id = raw.id
        CROSS JOIN payroll_benefit_adjustment pba
        INNER JOIN employee e ON e.id = pba.employee_id 
        INNER JOIN employee_position ep ON ep.employee_id = e.id 
        INNER JOIN company_structure cs ON cs.id = ep.company_structure_location_id  
        INNER JOIN company_structure_component csc ON csc.id = cs.company_structure_component_id
        INNER JOIN company_structure cs2 ON cs2.id = ep.company_structure_outlet_id 
        INNER JOIN company_structure_component csc2 ON csc2.id = cs2.company_structure_component_id
        INNER JOIN company_structure cs3 ON cs3.id = ep.company_structure_department_id 
        INNER JOIN company_structure_component csc3 ON csc3.id = cs3.company_structure_component_id
        INNER JOIN company_structure cs4 ON cs4.id = ep.company_structure_team_id 
        INNER JOIN company_structure_component csc4 ON csc4.id = cs4.company_structure_component_id
        INNER JOIN company_structure cs5 ON cs5.id = ep.company_structure_position_id  
        INNER JOIN company_structure_component csc5 ON csc5.id = cs5.company_structure_component_id
        WHERE workflow.request_type = 'PAYROLL_BENEFIT_ADJUSTMENT' AND approval.entity_id = pba.id
        UNION 
        SELECT approval.*, workflow.request_type,workflow.description,raw.id 
        AS request_approval_workflow_id,creator.id 
        AS user_id, creator.username, first_approver_user.username 
        AS first_approver_name, second_approver_user.username 
        AS second_approver_name, acknowledger_user.username
        AS acknowledger_name,
        e2.display_full_name_en,
        e2.display_full_name_kh,
        e2.id AS employee_id,
        e2.account_no AS employee_account_no,
        csc."name" AS location,
        csc2.name AS outlet, 
        csc3.name AS department, 
        csc4."name" AS team, 
        csc5.name AS position,
        cs.id AS location_id,
        cs2.id AS outlet_id,
        cs3.id AS department_id,
        cs4.id AS team_id,
        cs5.id  AS position_id,
        emp.display_full_name_en AS creator_employee_name,
        emp.display_full_name_kh AS creator_employee_name_kh,
        emp.id AS creator_employee_id,
        first_emp.id AS first_approver_employee_id,
        first_emp.display_full_name_en AS first_approver_employee_name,
        first_emp.display_full_name_kh AS first_approver_employee_name_kh,
        second_emp.id AS second_approver_employee_id,
        second_emp.display_full_name_en AS second_approver_employee_name,
        second_emp.display_full_name_kh AS second_approver_employee_name_kh,
        acknowledger_emp.id AS acknowledger_employee_id,
        acknowledger_emp.display_full_name_en AS acknowledger_employee_name,
        acknowledger_emp.display_full_name_kh AS acknowledger_employee_name_kh
        FROM approval_status approval 
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS creator 
        (
            id int,
            username text
        )
        ON creator.id = approval.created_by
        LEFT JOIN employee emp
        ON emp.user_id = creator.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS first_approver_user
        (
            id int,
            username text
        )
        ON first_approver_user.id = approval.first_approval_user_id
        LEFT JOIN employee first_emp
        ON first_emp.user_id = first_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS second_approver_user
        (
            id int,
            username text
        )
        ON second_approver_user.id = approval.second_approval_user_id
        LEFT JOIN employee second_emp
        ON second_emp.user_id = second_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS acknowledger_user
        (
            id int,
            username text
        )
        ON acknowledger_user.id = approval.acknowledge_user_id
        LEFT JOIN employee acknowledger_emp
        ON acknowledger_emp.user_id = acknowledger_user.id
        INNER JOIN request_work_flow_type workflow 
        ON approval.request_workflow_type_id = workflow.id
        INNER JOIN request_approval_workflow raw 
        ON approval.approval_workflow_id = raw.id
        CROSS JOIN employee e2
        INNER JOIN employee_position ep ON ep.employee_id = e2.id 
        INNER JOIN company_structure cs ON cs.id = ep.company_structure_location_id  
        INNER JOIN company_structure_component csc ON csc.id = cs.company_structure_component_id
        INNER JOIN company_structure cs2 ON cs2.id = ep.company_structure_outlet_id 
        INNER JOIN company_structure_component csc2 ON csc2.id = cs2.company_structure_component_id
        INNER JOIN company_structure cs3 ON cs3.id = ep.company_structure_department_id 
        INNER JOIN company_structure_component csc3 ON csc3.id = cs3.company_structure_component_id
        INNER JOIN company_structure cs4 ON cs4.id = ep.company_structure_team_id 
        INNER JOIN company_structure_component csc4 ON csc4.id = cs4.company_structure_component_id
        INNER JOIN company_structure cs5 ON cs5.id = ep.company_structure_position_id  
        INNER JOIN company_structure_component csc5 ON csc5.id = cs5.company_structure_component_id
        WHERE workflow.request_type = 'EMPLOYEE_INFO_UPDATE' AND approval.entity_id = e2.id
        UNION
        SELECT approval.*, workflow.request_type,workflow.description,raw.id 
        AS request_approval_workflow_id,creator.id 
        AS user_id, creator.username, first_approver_user.username 
        AS first_approver_name, second_approver_user.username 
        AS second_approver_name, acknowledger_user.username
        AS acknowledger_name,
        e.display_full_name_en, 
        e.display_full_name_kh,
        e.id AS employee_id,
        e.account_no AS employee_account_no,
        csc."name" AS location,
        csc2.name AS outlet, 
        csc3.name AS department, 
        csc4."name" AS team, 
        csc5.name AS position,
        cs.id AS location_id,
        cs2.id AS outlet_id,
        cs3.id AS department_id,
        cs4.id AS team_id,
        cs5.id  AS position_id,
        emp.display_full_name_en AS creator_employee_name,
        emp.display_full_name_kh AS creator_employee_name_kh,
        emp.id AS creator_employee_id,
        first_emp.id AS first_approver_employee_id,
        first_emp.display_full_name_en AS first_approver_employee_name,
        first_emp.display_full_name_kh AS first_approver_employee_name_kh,
        second_emp.id AS second_approver_employee_id,
        second_emp.display_full_name_en AS second_approver_employee_name,
        second_emp.display_full_name_kh AS second_approver_employee_name_kh,
        acknowledger_emp.id AS acknowledger_employee_id,
        acknowledger_emp.display_full_name_en AS acknowledger_employee_name,
        acknowledger_emp.display_full_name_kh AS acknowledger_employee_name_kh
        FROM approval_status approval 
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS creator 
        (
            id int,
            username text
        )
        ON creator.id = approval.created_by
        LEFT JOIN employee emp
        ON emp.user_id = creator.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS first_approver_user
        (
            id int,
            username text
        )
        ON first_approver_user.id = approval.first_approval_user_id
        LEFT JOIN employee first_emp
        ON first_emp.user_id = first_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS second_approver_user
        (
            id int,
            username text
        )
        ON second_approver_user.id = approval.second_approval_user_id
        LEFT JOIN employee second_emp
        ON second_emp.user_id = second_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS acknowledger_user
        (
            id int,
            username text
        )
        ON acknowledger_user.id = approval.acknowledge_user_id
        LEFT JOIN employee acknowledger_emp
        ON acknowledger_emp.user_id = acknowledger_user.id
        INNER JOIN request_work_flow_type workflow 
        ON approval.request_workflow_type_id = workflow.id
        INNER JOIN request_approval_workflow raw 
        ON approval.approval_workflow_id = raw.id
        CROSS JOIN employee_warning ew
        INNER JOIN employee e ON e.id = ew.employee_id 
        INNER JOIN employee_position ep ON ep.employee_id = e.id 
        INNER JOIN company_structure cs ON cs.id = ep.company_structure_location_id  
        INNER JOIN company_structure_component csc ON csc.id = cs.company_structure_component_id
        INNER JOIN company_structure cs2 ON cs2.id = ep.company_structure_outlet_id 
        INNER JOIN company_structure_component csc2 ON csc2.id = cs2.company_structure_component_id
        INNER JOIN company_structure cs3 ON cs3.id = ep.company_structure_department_id 
        INNER JOIN company_structure_component csc3 ON csc3.id = cs3.company_structure_component_id
        INNER JOIN company_structure cs4 ON cs4.id = ep.company_structure_team_id 
        INNER JOIN company_structure_component csc4 ON csc4.id = cs4.company_structure_component_id
        INNER JOIN company_structure cs5 ON cs5.id = ep.company_structure_position_id  
        INNER JOIN company_structure_component csc5 ON csc5.id = cs5.company_structure_component_id
        WHERE workflow.request_type = 'WARNING' AND ew.id = approval.entity_id
        UNION 
        SELECT approval.*, workflow.request_type,workflow.description,raw.id 
        AS request_approval_workflow_id,creator.id 
        AS user_id, creator.username, first_approver_user.username 
        AS first_approver_name, second_approver_user.username 
        AS second_approver_name, acknowledger_user.username
        AS acknowledger_name,
        e2.display_full_name_en,
        e2.display_full_name_kh,
        e2.id AS employee_id,
        e2.account_no AS employee_account_no,
        csc."name" AS location,
        csc2.name AS outlet, 
        csc3.name AS department, 
        csc4."name" AS team, 
        csc5.name AS position,
        cs.id AS location_id,
        cs2.id AS outlet_id,
        cs3.id AS department_id,
        cs4.id AS team_id,
        cs5.id  AS position_id,
        emp.display_full_name_en AS creator_employee_name,
        emp.display_full_name_kh AS creator_employee_name_kh,
        emp.id AS creator_employee_id,
        first_emp.id AS first_approver_employee_id,
        first_emp.display_full_name_en AS first_approver_employee_name,
        first_emp.display_full_name_kh AS first_approver_employee_name_kh,
        second_emp.id AS second_approver_employee_id,
        second_emp.display_full_name_en AS second_approver_employee_name,
        second_emp.display_full_name_kh AS second_approver_employee_name_kh,
        acknowledger_emp.id AS acknowledger_employee_id,
        acknowledger_emp.display_full_name_en AS acknowledger_employee_name,
        acknowledger_emp.display_full_name_kh AS acknowledger_employee_name_kh
        FROM approval_status approval 
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS creator 
        (
            id int,
            username text
        )
        ON creator.id = approval.created_by
        LEFT JOIN employee emp
        ON emp.user_id = creator.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS first_approver_user
        (
            id int,
            username text
        )
        ON first_approver_user.id = approval.first_approval_user_id
        LEFT JOIN employee first_emp
        ON first_emp.user_id = first_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS second_approver_user
        (
            id int,
            username text
        )
        ON second_approver_user.id = approval.second_approval_user_id
        LEFT JOIN employee second_emp
        ON second_emp.user_id = second_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS acknowledger_user
        (
            id int,
            username text
        )
        ON acknowledger_user.id = approval.acknowledge_user_id
        LEFT JOIN employee acknowledger_emp
        ON acknowledger_emp.user_id = acknowledger_user.id
        INNER JOIN request_work_flow_type workflow 
        ON approval.request_workflow_type_id = workflow.id
        INNER JOIN request_approval_workflow raw 
        ON approval.approval_workflow_id = raw.id
        CROSS JOIN employee e2
        INNER JOIN employee_position ep ON ep.employee_id = e2.id 
        INNER JOIN company_structure cs ON cs.id = ep.company_structure_location_id  
        INNER JOIN company_structure_component csc ON csc.id = cs.company_structure_component_id
        INNER JOIN company_structure cs2 ON cs2.id = ep.company_structure_outlet_id 
        INNER JOIN company_structure_component csc2 ON csc2.id = cs2.company_structure_component_id
        INNER JOIN company_structure cs3 ON cs3.id = ep.company_structure_department_id 
        INNER JOIN company_structure_component csc3 ON csc3.id = cs3.company_structure_component_id
        INNER JOIN company_structure cs4 ON cs4.id = ep.company_structure_team_id 
        INNER JOIN company_structure_component csc4 ON csc4.id = cs4.company_structure_component_id
        INNER JOIN company_structure cs5 ON cs5.id = ep.company_structure_position_id  
        INNER JOIN company_structure_component csc5 ON csc5.id = cs5.company_structure_component_id
        WHERE workflow.request_type = 'EMPLOYEE_INFO_UPDATE' AND approval.entity_id = e2.id
        UNION
        SELECT approval.*, workflow.request_type,workflow.description,raw.id 
        AS request_approval_workflow_id,creator.id 
        AS user_id, creator.username, first_approver_user.username 
        AS first_approver_name, second_approver_user.username 
        AS second_approver_name, acknowledger_user.username
        AS acknowledger_name,
        e.display_full_name_en, 
        e.display_full_name_kh,
        e.id AS employee_id,
        e.account_no AS employee_account_no,
        csc."name" AS location,
        csc2.name AS outlet, 
        csc3.name AS department, 
        csc4."name" AS team, 
        csc5.name AS position,
        cs.id AS location_id,
        cs2.id AS outlet_id,
        cs3.id AS department_id,
        cs4.id AS team_id,
        cs5.id  AS position_id,
        emp.display_full_name_en AS creator_employee_name,
        emp.display_full_name_kh AS creator_employee_name_kh,
        emp.id AS creator_employee_id,
        first_emp.id AS first_approver_employee_id,
        first_emp.display_full_name_en AS first_approver_employee_name,
        first_emp.display_full_name_kh AS first_approver_employee_name_kh,
        second_emp.id AS second_approver_employee_id,
        second_emp.display_full_name_en AS second_approver_employee_name,
        second_emp.display_full_name_kh AS second_approver_employee_name_kh,
        acknowledger_emp.id AS acknowledger_employee_id,
        acknowledger_emp.display_full_name_en AS acknowledger_employee_name,
        acknowledger_emp.display_full_name_kh AS acknowledger_employee_name_kh
        FROM approval_status approval 
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS creator 
        (
            id int,
            username text
        )
        ON creator.id = approval.created_by
        LEFT JOIN employee emp
        ON emp.user_id = creator.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS first_approver_user
        (
            id int,
            username text
        )
        ON first_approver_user.id = approval.first_approval_user_id
        LEFT JOIN employee first_emp
        ON first_emp.user_id = first_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS second_approver_user
        (
            id int,
            username text
        )
        ON second_approver_user.id = approval.second_approval_user_id
        LEFT JOIN employee second_emp
        ON second_emp.user_id = second_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS acknowledger_user
        (
            id int,
            username text
        )
        ON acknowledger_user.id = approval.acknowledge_user_id
        LEFT JOIN employee acknowledger_emp
        ON acknowledger_emp.user_id = acknowledger_user.id
        INNER JOIN request_work_flow_type workflow 
        ON approval.request_workflow_type_id = workflow.id
        INNER JOIN request_approval_workflow raw 
        ON approval.approval_workflow_id = raw.id
        CROSS JOIN employee_resignation er
        INNER JOIN employee e ON e.id = er.employee_id 
        INNER JOIN employee_position ep ON ep.employee_id = e.id 
        INNER JOIN company_structure cs ON cs.id = ep.company_structure_location_id  
        INNER JOIN company_structure_component csc ON csc.id = cs.company_structure_component_id
        INNER JOIN company_structure cs2 ON cs2.id = ep.company_structure_outlet_id 
        INNER JOIN company_structure_component csc2 ON csc2.id = cs2.company_structure_component_id
        INNER JOIN company_structure cs3 ON cs3.id = ep.company_structure_department_id 
        INNER JOIN company_structure_component csc3 ON csc3.id = cs3.company_structure_component_id
        INNER JOIN company_structure cs4 ON cs4.id = ep.company_structure_team_id 
        INNER JOIN company_structure_component csc4 ON csc4.id = cs4.company_structure_component_id
        INNER JOIN company_structure cs5 ON cs5.id = ep.company_structure_position_id  
        INNER JOIN company_structure_component csc5 ON csc5.id = cs5.company_structure_component_id
        WHERE workflow.request_type = 'RESIGNATION_REQUEST' AND er.id = approval.entity_id
        UNION
        SELECT approval.*, workflow.request_type,workflow.description,raw.id 
        AS request_approval_workflow_id,creator.id 
        AS user_id, creator.username, first_approver_user.username 
        AS first_approver_name, second_approver_user.username 
        AS second_approver_name, acknowledger_user.username
        AS acknowledger_name,
        e.display_full_name_en, 
        e.display_full_name_kh,
        e.id AS employee_id,
        e.account_no AS employee_account_no,
        csc."name" AS location,
        csc2.name AS outlet, 
        csc3.name AS department, 
        csc4."name" AS team, 
        csc5.name AS position,
        cs.id AS location_id,
        cs2.id AS outlet_id,
        cs3.id AS department_id,
        cs4.id AS team_id,
        cs5.id  AS position_id,
        emp.display_full_name_en AS creator_employee_name,
        emp.display_full_name_kh AS creator_employee_name_kh,
        emp.id AS creator_employee_id,
        first_emp.id AS first_approver_employee_id,
        first_emp.display_full_name_en AS first_approver_employee_name,
        first_emp.display_full_name_kh AS first_approver_employee_name_kh,
        second_emp.id AS second_approver_employee_id,
        second_emp.display_full_name_en AS second_approver_employee_name,
        second_emp.display_full_name_kh AS second_approver_employee_name_kh,
        acknowledger_emp.id AS acknowledger_employee_id,
        acknowledger_emp.display_full_name_en AS acknowledger_employee_name,
        acknowledger_emp.display_full_name_kh AS acknowledger_employee_name_kh
        FROM approval_status approval 
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS creator 
        (
            id int,
            username text
        )
        ON creator.id = approval.created_by
        LEFT JOIN employee emp
        ON emp.user_id = creator.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS first_approver_user
        (
            id int,
            username text
        )
        ON first_approver_user.id = approval.first_approval_user_id
        LEFT JOIN employee first_emp
        ON first_emp.user_id = first_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS second_approver_user
        (
            id int,
            username text
        )
        ON second_approver_user.id = approval.second_approval_user_id
        LEFT JOIN employee second_emp
        ON second_emp.user_id = second_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS acknowledger_user
        (
            id int,
            username text
        )
        ON acknowledger_user.id = approval.acknowledge_user_id
        LEFT JOIN employee acknowledger_emp
        ON acknowledger_emp.user_id = acknowledger_user.id
        INNER JOIN request_work_flow_type workflow 
        ON approval.request_workflow_type_id = workflow.id
        INNER JOIN request_approval_workflow raw 
        ON approval.approval_workflow_id = raw.id
        CROSS JOIN payroll_deduction pd
        INNER JOIN employee e ON e.id = pd.employee_id 
        INNER JOIN employee_position ep ON ep.employee_id = e.id 
        INNER JOIN company_structure cs ON cs.id = ep.company_structure_location_id  
        INNER JOIN company_structure_component csc ON csc.id = cs.company_structure_component_id
        INNER JOIN company_structure cs2 ON cs2.id = ep.company_structure_outlet_id 
        INNER JOIN company_structure_component csc2 ON csc2.id = cs2.company_structure_component_id
        INNER JOIN company_structure cs3 ON cs3.id = ep.company_structure_department_id 
        INNER JOIN company_structure_component csc3 ON csc3.id = cs3.company_structure_component_id
        INNER JOIN company_structure cs4 ON cs4.id = ep.company_structure_team_id 
        INNER JOIN company_structure_component csc4 ON csc4.id = cs4.company_structure_component_id
        INNER JOIN company_structure cs5 ON cs5.id = ep.company_structure_position_id  
        INNER JOIN company_structure_component csc5 ON csc5.id = cs5.company_structure_component_id
        WHERE workflow.request_type = 'PAYROLL_DEDUCTION' AND pd.id = approval.entity_id
        UNION
        SELECT approval.*, workflow.request_type,workflow.description,raw.id 
        AS request_approval_workflow_id,creator.id 
        AS user_id, creator.username, first_approver_user.username 
        AS first_approver_name, second_approver_user.username 
        AS second_approver_name, acknowledger_user.username
        AS acknowledger_name,
        e.display_full_name_en,
        e.display_full_name_kh,
        e.id AS employee_id,
        e.account_no AS employee_account_no,
        csc."name" AS location,
        csc2.name AS outlet, 
        csc3.name AS department, 
        csc4."name" AS team, 
        csc5.name AS position,
        cs.id AS location_id,
        cs2.id AS outlet_id,
        cs3.id AS department_id,
        cs4.id AS team_id,
        cs5.id  AS position_id,
        emp.display_full_name_en AS creator_employee_name,
        emp.display_full_name_kh AS creator_employee_name_kh,
        emp.id AS creator_employee_id,
        first_emp.id AS first_approver_employee_id,
        first_emp.display_full_name_en AS first_approver_employee_name,
        first_emp.display_full_name_kh AS first_approver_employee_name_kh,
        second_emp.id AS second_approver_employee_id,
        second_emp.display_full_name_en AS second_approver_employee_name,
        second_emp.display_full_name_kh AS second_approver_employee_name_kh,
        acknowledger_emp.id AS acknowledger_employee_id,
        acknowledger_emp.display_full_name_en AS acknowledger_employee_name,
        acknowledger_emp.display_full_name_kh AS acknowledger_employee_name_kh
        FROM approval_status approval 
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS creator 
        (
            id int,
            username text
        )
        ON creator.id = approval.created_by
        LEFT JOIN employee emp
        ON emp.user_id = creator.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS first_approver_user
        (
            id int,
            username text
        )
        ON first_approver_user.id = approval.first_approval_user_id
        LEFT JOIN employee first_emp
        ON first_emp.user_id = first_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS second_approver_user
        (
            id int,
            username text
        )
        ON second_approver_user.id = approval.second_approval_user_id
        LEFT JOIN employee second_emp
        ON second_emp.user_id = second_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS acknowledger_user
        (
            id int,
            username text
        )
        ON acknowledger_user.id = approval.acknowledge_user_id
        LEFT JOIN employee acknowledger_emp
        ON acknowledger_emp.user_id = acknowledger_user.id
        INNER JOIN request_work_flow_type workflow 
        ON approval.request_workflow_type_id = workflow.id
        INNER JOIN request_approval_workflow raw 
        ON approval.approval_workflow_id = raw.id
        CROSS JOIN day_off_request dor
        INNER JOIN employee e ON e.id = dor.employee_id 
        INNER JOIN employee_position ep ON ep.employee_id = e.id 
        INNER JOIN company_structure cs ON cs.id = ep.company_structure_location_id  
        INNER JOIN company_structure_component csc ON csc.id = cs.company_structure_component_id
        INNER JOIN company_structure cs2 ON cs2.id = ep.company_structure_outlet_id 
        INNER JOIN company_structure_component csc2 ON csc2.id = cs2.company_structure_component_id
        INNER JOIN company_structure cs3 ON cs3.id = ep.company_structure_department_id 
        INNER JOIN company_structure_component csc3 ON csc3.id = cs3.company_structure_component_id
        INNER JOIN company_structure cs4 ON cs4.id = ep.company_structure_team_id 
        INNER JOIN company_structure_component csc4 ON csc4.id = cs4.company_structure_component_id
        INNER JOIN company_structure cs5 ON cs5.id = ep.company_structure_position_id  
        INNER JOIN company_structure_component csc5 ON csc5.id = cs5.company_structure_component_id
        WHERE workflow.request_type = 'DAY_OFF_REQUEST' AND dor.id = approval.entity_id
        UNION
        SELECT approval.*, workflow.request_type,workflow.description,raw.id 
        AS request_approval_workflow_id,creator.id 
        AS user_id, creator.username, first_approver_user.username 
        AS first_approver_name, second_approver_user.username 
        AS second_approver_name, acknowledger_user.username
        AS acknowledger_name,
        e.display_full_name_en, 
        e.display_full_name_kh,
        e.id AS employee_id,
        e.account_no AS employee_account_no,
        csc."name" AS location,
        csc2.name AS outlet, 
        csc3.name AS department, 
        csc4."name" AS team, 
        csc5.name AS position,
        cs.id AS location_id,
        cs2.id AS outlet_id,
        cs3.id AS department_id,
        cs4.id AS team_id,
        cs5.id  AS position_id,
        emp.display_full_name_en AS creator_employee_name,
        emp.display_full_name_kh AS creator_employee_name_kh,
        emp.id AS creator_employee_id,
        first_emp.id AS first_approver_employee_id,
        first_emp.display_full_name_en AS first_approver_employee_name,
        first_emp.display_full_name_kh AS first_approver_employee_name_kh,
        second_emp.id AS second_approver_employee_id,
        second_emp.display_full_name_en AS second_approver_employee_name,
        second_emp.display_full_name_kh AS second_approver_employee_name_kh,
        acknowledger_emp.id AS acknowledger_employee_id,
        acknowledger_emp.display_full_name_en AS acknowledger_employee_name,
        acknowledger_emp.display_full_name_kh AS acknowledger_employee_name_kh
        FROM approval_status approval 
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS creator 
        (
            id int,
            username text
        )
        ON creator.id = approval.created_by
        LEFT JOIN employee emp
        ON emp.user_id = creator.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS first_approver_user
        (
            id int,
            username text
        )
        ON first_approver_user.id = approval.first_approval_user_id
        LEFT JOIN employee first_emp
        ON first_emp.user_id = first_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS second_approver_user
        (
            id int,
            username text
        )
        ON second_approver_user.id = approval.second_approval_user_id
        LEFT JOIN employee second_emp
        ON second_emp.user_id = second_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS acknowledger_user
        (
            id int,
            username text
        )
        ON acknowledger_user.id = approval.acknowledge_user_id
        LEFT JOIN employee acknowledger_emp
        ON acknowledger_emp.user_id = acknowledger_user.id
        INNER JOIN request_work_flow_type workflow 
        ON approval.request_workflow_type_id = workflow.id
        INNER JOIN request_approval_workflow raw 
        ON approval.approval_workflow_id = raw.id
        CROSS JOIN employee_movement em
        INNER JOIN employee e ON e.id = em.employee_id 
        INNER JOIN employee_position ep ON ep.employee_id = e.id 
        INNER JOIN company_structure cs ON cs.id = ep.company_structure_location_id  
        INNER JOIN company_structure_component csc ON csc.id = cs.company_structure_component_id
        INNER JOIN company_structure cs2 ON cs2.id = ep.company_structure_outlet_id 
        INNER JOIN company_structure_component csc2 ON csc2.id = cs2.company_structure_component_id
        INNER JOIN company_structure cs3 ON cs3.id = ep.company_structure_department_id 
        INNER JOIN company_structure_component csc3 ON csc3.id = cs3.company_structure_component_id
        INNER JOIN company_structure cs4 ON cs4.id = ep.company_structure_team_id 
        INNER JOIN company_structure_component csc4 ON csc4.id = cs4.company_structure_component_id
        INNER JOIN company_structure cs5 ON cs5.id = ep.company_structure_position_id  
        INNER JOIN company_structure_component csc5 ON csc5.id = cs5.company_structure_component_id
        WHERE workflow.request_type = 'MOVEMENT' AND em.id = approval.entity_id
        UNION
        SELECT approval.*, workflow.request_type,workflow.description,raw.id 
        AS request_approval_workflow_id,creator.id 
        AS user_id, creator.username, first_approver_user.username 
        AS first_approver_name, second_approver_user.username 
        AS second_approver_name, acknowledger_user.username
        AS acknowledger_name,
        e.display_full_name_en, 
        e.display_full_name_kh,
        e.id AS employee_id,
        e.account_no AS employee_account_no,
        csc."name" AS location,
        csc2.name AS outlet, 
        csc3.name AS department, 
        csc4."name" AS team, 
        csc5.name AS position,
        cs.id AS location_id,
        cs2.id AS outlet_id,
        cs3.id AS department_id,
        cs4.id AS team_id,
        cs5.id  AS position_id,
        emp.display_full_name_en AS creator_employee_name,
        emp.display_full_name_kh AS creator_employee_name_kh,
        emp.id AS creator_employee_id,
        first_emp.id AS first_approver_employee_id,
        first_emp.display_full_name_en AS first_approver_employee_name,
        first_emp.display_full_name_kh AS first_approver_employee_name_kh,
        second_emp.id AS second_approver_employee_id,
        second_emp.display_full_name_en AS second_approver_employee_name,
        second_emp.display_full_name_kh AS second_approver_employee_name_kh,
        acknowledger_emp.id AS acknowledger_employee_id,
        acknowledger_emp.display_full_name_en AS acknowledger_employee_name,
        acknowledger_emp.display_full_name_kh AS acknowledger_employee_name_kh
        FROM approval_status approval 
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS creator 
        (
            id int,
            username text
        )
        ON creator.id = approval.created_by
        LEFT JOIN employee emp
        ON emp.user_id = creator.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS first_approver_user
        (
            id int,
            username text
        )
        ON first_approver_user.id = approval.first_approval_user_id
        LEFT JOIN employee first_emp
        ON first_emp.user_id = first_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS second_approver_user
        (
            id int,
            username text
        )
        ON second_approver_user.id = approval.second_approval_user_id
        LEFT JOIN employee second_emp
        ON second_emp.user_id = second_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS acknowledger_user
        (
            id int,
            username text
        )
        ON acknowledger_user.id = approval.acknowledge_user_id
        LEFT JOIN employee acknowledger_emp
        ON acknowledger_emp.user_id = acknowledger_user.id
        INNER JOIN request_work_flow_type workflow 
        ON approval.request_workflow_type_id = workflow.id
        INNER JOIN request_approval_workflow raw 
        ON approval.approval_workflow_id = raw.id
        CROSS JOIN missed_scan_request msr
        INNER JOIN employee e ON e.id = msr.employee_id 
        INNER JOIN employee_position ep ON ep.employee_id = e.id 
        INNER JOIN company_structure cs ON cs.id = ep.company_structure_location_id  
        INNER JOIN company_structure_component csc ON csc.id = cs.company_structure_component_id
        INNER JOIN company_structure cs2 ON cs2.id = ep.company_structure_outlet_id 
        INNER JOIN company_structure_component csc2 ON csc2.id = cs2.company_structure_component_id
        INNER JOIN company_structure cs3 ON cs3.id = ep.company_structure_department_id 
        INNER JOIN company_structure_component csc3 ON csc3.id = cs3.company_structure_component_id
        INNER JOIN company_structure cs4 ON cs4.id = ep.company_structure_team_id 
        INNER JOIN company_structure_component csc4 ON csc4.id = cs4.company_structure_component_id
        INNER JOIN company_structure cs5 ON cs5.id = ep.company_structure_position_id  
        INNER JOIN company_structure_component csc5 ON csc5.id = cs5.company_structure_component_id
        WHERE workflow.request_type = 'MISSED_SCAN' AND msr.id = approval.entity_id
        UNION
        SELECT approval.*, workflow.request_type,workflow.description,raw.id 
        AS request_approval_workflow_id,creator.id 
        AS user_id, creator.username, first_approver_user.username 
        AS first_approver_name, second_approver_user.username 
        AS second_approver_name, acknowledger_user.username
        AS acknowledger_name,
        e.display_full_name_en,
        e.display_full_name_kh,
        e.id AS employee_id,
        e.account_no AS employee_account_no,
        csc."name" AS location,
        csc2.name AS outlet, 
        csc3.name AS department, 
        csc4."name" AS team, 
        csc5.name AS position,
        cs.id AS location_id,
        cs2.id AS outlet_id,
        cs3.id AS department_id,
        cs4.id AS team_id,
        cs5.id  AS position_id,
        emp.display_full_name_en AS creator_employee_name,
        emp.display_full_name_kh AS creator_employee_name_kh,
        emp.id AS creator_employee_id,
        first_emp.id AS first_approver_employee_id,
        first_emp.display_full_name_en AS first_approver_employee_name,
        first_emp.display_full_name_kh AS first_approver_employee_name_kh,
        second_emp.id AS second_approver_employee_id,
        second_emp.display_full_name_en AS second_approver_employee_name,
        second_emp.display_full_name_kh AS second_approver_employee_name_kh,
        acknowledger_emp.id AS acknowledger_employee_id,
        acknowledger_emp.display_full_name_en AS acknowledger_employee_name,
        acknowledger_emp.display_full_name_kh AS acknowledger_employee_name_kh
        FROM approval_status approval 
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS creator 
        (
            id int,
            username text
        )
        ON creator.id = approval.created_by
        LEFT JOIN employee emp
        ON emp.user_id = creator.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS first_approver_user
        (
            id int,
            username text
        )
        ON first_approver_user.id = approval.first_approval_user_id
        LEFT JOIN employee first_emp
        ON first_emp.user_id = first_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS second_approver_user
        (
            id int,
            username text
        )
        ON second_approver_user.id = approval.second_approval_user_id
        LEFT JOIN employee second_emp
        ON second_emp.user_id = second_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS acknowledger_user
        (
            id int,
            username text
        )
        ON acknowledger_user.id = approval.acknowledge_user_id
        LEFT JOIN employee acknowledger_emp
        ON acknowledger_emp.user_id = acknowledger_user.id
        INNER JOIN request_work_flow_type workflow 
        ON approval.request_workflow_type_id = workflow.id
        INNER JOIN request_approval_workflow raw 
        ON approval.approval_workflow_id = raw.id
        CROSS JOIN borrow_or_payback_request bopr
        INNER JOIN employee e ON e.id = bopr.employee_id 
        INNER JOIN employee_position ep ON ep.employee_id = e.id 
        INNER JOIN company_structure cs ON cs.id = ep.company_structure_location_id  
        INNER JOIN company_structure_component csc ON csc.id = cs.company_structure_component_id
        INNER JOIN company_structure cs2 ON cs2.id = ep.company_structure_outlet_id 
        INNER JOIN company_structure_component csc2 ON csc2.id = cs2.company_structure_component_id
        INNER JOIN company_structure cs3 ON cs3.id = ep.company_structure_department_id 
        INNER JOIN company_structure_component csc3 ON csc3.id = cs3.company_structure_component_id
        INNER JOIN company_structure cs4 ON cs4.id = ep.company_structure_team_id 
        INNER JOIN company_structure_component csc4 ON csc4.id = cs4.company_structure_component_id
        INNER JOIN company_structure cs5 ON cs5.id = ep.company_structure_position_id  
        INNER JOIN company_structure_component csc5 ON csc5.id = cs5.company_structure_component_id
        WHERE workflow.request_type = 'BORROW/PAYBACK_HOUR' AND bopr.id = approval.entity_id
        UNION
        SELECT approval.*, workflow.request_type,workflow.description,raw.id 
        AS request_approval_workflow_id,creator.id 
        AS user_id, creator.username, first_approver_user.username 
        AS first_approver_name, second_approver_user.username 
        AS second_approver_name, acknowledger_user.username
        AS acknowledger_name,
        e.display_full_name_en, 
        e.display_full_name_kh,
        e.id AS employee_id,
        e.account_no AS employee_account_no,
        csc."name" AS location,
        csc2.name AS outlet, 
        csc3.name AS department, 
        csc4."name" AS team, 
        csc5.name AS position,
        cs.id AS location_id,
        cs2.id AS outlet_id,
        cs3.id AS department_id,
        cs4.id AS team_id,
        cs5.id  AS position_id,
        emp.display_full_name_en AS creator_employee_name,
        emp.display_full_name_kh AS creator_employee_name_kh,
        emp.id AS creator_employee_id,
        first_emp.id AS first_approver_employee_id,
        first_emp.display_full_name_en AS first_approver_employee_name,
        first_emp.display_full_name_kh AS first_approver_employee_name_kh,
        second_emp.id AS second_approver_employee_id,
        second_emp.display_full_name_en AS second_approver_employee_name,
        second_emp.display_full_name_kh AS second_approver_employee_name_kh,
        acknowledger_emp.id AS acknowledger_employee_id,
        acknowledger_emp.display_full_name_en AS acknowledger_employee_name,
        acknowledger_emp.display_full_name_kh AS acknowledger_employee_name_kh
        FROM approval_status approval 
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS creator 
        (
            id int,
            username text
        )
        ON creator.id = approval.created_by
        LEFT JOIN employee emp
        ON emp.user_id = creator.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS first_approver_user
        (
            id int,
            username text
        )
        ON first_approver_user.id = approval.first_approval_user_id
        LEFT JOIN employee first_emp
        ON first_emp.user_id = first_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS second_approver_user
        (
            id int,
            username text
        )
        ON second_approver_user.id = approval.second_approval_user_id
        LEFT JOIN employee second_emp
        ON second_emp.user_id = second_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS acknowledger_user
        (
            id int,
            username text
        )
        ON acknowledger_user.id = approval.acknowledge_user_id
        LEFT JOIN employee acknowledger_emp
        ON acknowledger_emp.user_id = acknowledger_user.id
        INNER JOIN request_work_flow_type workflow 
        ON approval.request_workflow_type_id = workflow.id
        INNER JOIN request_approval_workflow raw 
        ON approval.approval_workflow_id = raw.id
        CROSS JOIN overtime_request or2
        INNER JOIN employee e ON e.id = or2.employee_id 
        INNER JOIN employee_position ep ON ep.employee_id = e.id 
        INNER JOIN company_structure cs ON cs.id = ep.company_structure_location_id  
        INNER JOIN company_structure_component csc ON csc.id = cs.company_structure_component_id
        INNER JOIN company_structure cs2 ON cs2.id = ep.company_structure_outlet_id 
        INNER JOIN company_structure_component csc2 ON csc2.id = cs2.company_structure_component_id
        INNER JOIN company_structure cs3 ON cs3.id = ep.company_structure_department_id 
        INNER JOIN company_structure_component csc3 ON csc3.id = cs3.company_structure_component_id
        INNER JOIN company_structure cs4 ON cs4.id = ep.company_structure_team_id 
        INNER JOIN company_structure_component csc4 ON csc4.id = cs4.company_structure_component_id
        INNER JOIN company_structure cs5 ON cs5.id = ep.company_structure_position_id  
        INNER JOIN company_structure_component csc5 ON csc5.id = cs5.company_structure_component_id
        WHERE workflow.request_type = 'OVERTIME_REQUEST' AND or2.id = approval.entity_id
        UNION
        SELECT approval.*, workflow.request_type,workflow.description,raw.id 
        AS request_approval_workflow_id,creator.id 
        AS user_id, creator.username, first_approver_user.username 
        AS first_approver_name, second_approver_user.username 
        AS second_approver_name, acknowledger_user.username
        AS acknowledger_name,
        e.display_full_name_en,
        e.display_full_name_kh,
        e.id AS employee_id,
        e.account_no AS employee_account_no,
        csc."name" AS location,
        csc2.name AS outlet, 
        csc3.name AS department, 
        csc4."name" AS team, 
        csc5.name AS position,
        cs.id AS location_id,
        cs2.id AS outlet_id,
        cs3.id AS department_id,
        cs4.id AS team_id,
        cs5.id  AS position_id,
        emp.display_full_name_en AS creator_employee_name,
        emp.display_full_name_kh AS creator_employee_name_kh,
        emp.id AS creator_employee_id,
        first_emp.id AS first_approver_employee_id,
        first_emp.display_full_name_en AS first_approver_employee_name,
        first_emp.display_full_name_kh AS first_approver_employee_name_kh,
        second_emp.id AS second_approver_employee_id,
        second_emp.display_full_name_en AS second_approver_employee_name,
        second_emp.display_full_name_kh AS second_approver_employee_name_kh,
        acknowledger_emp.id AS acknowledger_employee_id,
        acknowledger_emp.display_full_name_en AS acknowledger_employee_name,
        acknowledger_emp.display_full_name_kh AS acknowledger_employee_name_kh
        FROM approval_status approval 
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS creator 
        (
            id int,
            username text
        )
        ON creator.id = approval.created_by
        LEFT JOIN employee emp
        ON emp.user_id = creator.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS first_approver_user
        (
            id int,
            username text
        )
        ON first_approver_user.id = approval.first_approval_user_id
        LEFT JOIN employee first_emp
        ON first_emp.user_id = first_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS second_approver_user
        (
            id int,
            username text
        )
        ON second_approver_user.id = approval.second_approval_user_id
        LEFT JOIN employee second_emp
        ON second_emp.user_id = second_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS acknowledger_user
        (
            id int,
            username text
        )
        ON acknowledger_user.id = approval.acknowledge_user_id
        LEFT JOIN employee acknowledger_emp
        ON acknowledger_emp.user_id = acknowledger_user.id
        INNER JOIN request_work_flow_type workflow 
        ON approval.request_workflow_type_id = workflow.id
        INNER JOIN request_approval_workflow raw 
        ON approval.approval_workflow_id = raw.id
        CROSS JOIN mission_request mr
        INNER JOIN employee e ON e.id = mr.employee_id 
        INNER JOIN employee_position ep ON ep.employee_id = e.id 
        INNER JOIN company_structure cs ON cs.id = ep.company_structure_location_id  
        INNER JOIN company_structure_component csc ON csc.id = cs.company_structure_component_id
        INNER JOIN company_structure cs2 ON cs2.id = ep.company_structure_outlet_id 
        INNER JOIN company_structure_component csc2 ON csc2.id = cs2.company_structure_component_id
        INNER JOIN company_structure cs3 ON cs3.id = ep.company_structure_department_id 
        INNER JOIN company_structure_component csc3 ON csc3.id = cs3.company_structure_component_id
        INNER JOIN company_structure cs4 ON cs4.id = ep.company_structure_team_id 
        INNER JOIN company_structure_component csc4 ON csc4.id = cs4.company_structure_component_id
        INNER JOIN company_structure cs5 ON cs5.id = ep.company_structure_position_id  
        INNER JOIN company_structure_component csc5 ON csc5.id = cs5.company_structure_component_id
        WHERE workflow.request_type = 'MISSION_REQUEST' AND mr.id = approval.entity_id
        UNION
        SELECT approval.*, workflow.request_type,workflow.description,raw.id 
        AS request_approval_workflow_id,creator.id 
        AS user_id, creator.username, first_approver_user.username 
        AS first_approver_name, second_approver_user.username 
        AS second_approver_name, acknowledger_user.username
        AS acknowledger_name,
        e.display_full_name_en, 
        e.display_full_name_kh,
        e.id AS employee_id,
        e.account_no AS employee_account_no,
        csc."name" AS location,
        csc2.name AS outlet, 
        csc3.name AS department, 
        csc4."name" AS team, 
        csc5.name AS position,
        cs.id AS location_id,
        cs2.id AS outlet_id,
        cs3.id AS department_id,
        cs4.id AS team_id,
        cs5.id  AS position_id,
        emp.display_full_name_en AS creator_employee_name,
        emp.display_full_name_kh AS creator_employee_name_kh,
        emp.id AS creator_employee_id,
        first_emp.id AS first_approver_employee_id,
        first_emp.display_full_name_en AS first_approver_employee_name,
        first_emp.display_full_name_kh AS first_approver_employee_name_kh,
        second_emp.id AS second_approver_employee_id,
        second_emp.display_full_name_en AS second_approver_employee_name,
        second_emp.display_full_name_kh AS second_approver_employee_name_kh,
        acknowledger_emp.id AS acknowledger_employee_id,
        acknowledger_emp.display_full_name_en AS acknowledger_employee_name,
        acknowledger_emp.display_full_name_kh AS acknowledger_employee_name_kh
        FROM approval_status approval 
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS creator 
        (
            id int,
            username text
        )
        ON creator.id = approval.created_by
        LEFT JOIN employee emp
        ON emp.user_id = creator.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS first_approver_user
        (
            id int,
            username text
        )
        ON first_approver_user.id = approval.first_approval_user_id
        LEFT JOIN employee first_emp
        ON first_emp.user_id = first_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS second_approver_user
        (
            id int,
            username text
        )
        ON second_approver_user.id = approval.second_approval_user_id
        LEFT JOIN employee second_emp
        ON second_emp.user_id = second_approver_user.id
        LEFT JOIN dblink('authentication','SELECT id, username FROM "user"') AS acknowledger_user
        (
            id int,
            username text
        )
        ON acknowledger_user.id = approval.acknowledge_user_id
        LEFT JOIN employee acknowledger_emp
        ON acknowledger_emp.user_id = acknowledger_user.id
        INNER JOIN request_work_flow_type workflow 
        ON approval.request_workflow_type_id = workflow.id
        INNER JOIN request_approval_workflow raw 
        ON approval.approval_workflow_id = raw.id
        CROSS JOIN leave_request lr
        INNER JOIN employee e ON e.id = lr.employee_id 
        INNER JOIN employee_position ep ON ep.employee_id = e.id 
        INNER JOIN company_structure cs ON cs.id = ep.company_structure_location_id  
        INNER JOIN company_structure_component csc ON csc.id = cs.company_structure_component_id
        INNER JOIN company_structure cs2 ON cs2.id = ep.company_structure_outlet_id 
        INNER JOIN company_structure_component csc2 ON csc2.id = cs2.company_structure_component_id
        INNER JOIN company_structure cs3 ON cs3.id = ep.company_structure_department_id 
        INNER JOIN company_structure_component csc3 ON csc3.id = cs3.company_structure_component_id
        INNER JOIN company_structure cs4 ON cs4.id = ep.company_structure_team_id 
        INNER JOIN company_structure_component csc4 ON csc4.id = cs4.company_structure_component_id
        INNER JOIN company_structure cs5 ON cs5.id = ep.company_structure_position_id  
        INNER JOIN company_structure_component csc5 ON csc5.id = cs5.company_structure_component_id
        WHERE workflow.request_type = 'LEAVE_REQUEST' AND lr.id = approval.entity_id
        WITH DATA;   
    `);

    //create function to trigger changes of approval status and refresh materialized view
    await queryRunner.query(`
        DROP TRIGGER IF EXISTS refresh_approval_status ON approval_status;
        DROP FUNCTION IF EXISTS refresh_approval_status_view;
        
        CREATE OR REPLACE FUNCTION refresh_approval_status_view()
        RETURNS trigger LANGUAGE PLPGSQL AS $$
        BEGIN
            REFRESH MATERIALIZED VIEW approval_status_view;
            RETURN NULL;
        END;
        $$;
        
        CREATE TRIGGER refresh_approval_status
        AFTER INSERT OR UPDATE OR DELETE ON approval_status
        FOR EACH ROW
        EXECUTE PROCEDURE refresh_approval_status_view();
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
