import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEmployeeMpath1706061629991 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP FUNCTION IF EXISTS get_nested_team;
        DROP PROCEDURE IF EXISTS set_new_mpath;
        DROP FUNCTION IF EXISTS get_mpath_by_team_id;
        
        CREATE OR REPLACE FUNCTION get_nested_team(team_id INTEGER, companyStructureTeamIds INTEGER[])
        RETURNS TABLE (teamIds INTEGER[]) AS $$
        DECLARE
            parent_id INTEGER;
            structure_type VARCHAR;
            teamIds INTEGER[];
        BEGIN
            SELECT cs.parent_id,csc."type"
            INTO parent_id, structure_type
            FROM company_structure cs 
            INNER JOIN company_structure_component csc  
            ON cs.company_structure_component_id = csc.id
            INNER JOIN company_structure cs2 
            ON cs.parent_id = cs2.id
            WHERE cs.id = team_id;
        
            teamIds := ARRAY[team_id] || companyStructureTeamIds;
            RAISE NOTICE 'Team Ids:%', teamIds;
            
            IF parent_id IS NOT NULL THEN
                structure_type := '';
                teamIds := get_nested_team(parent_id, teamIds);
            END IF;
        
            RAISE NOTICE 'Result:%', teamIds;
        
            RETURN QUERY SELECT teamIds;
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE OR REPLACE FUNCTION get_mpath_by_team_id(structureTeamId INTEGER)
        RETURNS VARCHAR AS $$
        DECLARE
            mpath VARCHAR;
            teamIds INTEGER[];
            teamId INTEGER;
            positionId INTEGER;
            item INTEGER;
            positionLevelNumber VARCHAR;
        BEGIN
            SELECT 
                company_structure_team_id,
                company_structure_position_id
            INTO 
                teamId,
                positionId
            FROM employee_position
            WHERE company_structure_team_id = structureTeamId;
        
            teamIds := get_nested_team(teamId, teamIds);
        
            FOREACH item IN ARRAY teamIds
            LOOP
                IF mpath IS	NULL THEN
                    mpath := CONCAT(item);
                ELSE
                    mpath := CONCAT(mpath,'.',item);
                END	IF;
                
            END LOOP;
        
            RAISE NOTICE 'TeamIds:%', mpath;
        
            SELECT pl.level_number 
            INTO positionLevelNumber
            FROM company_structure cs 
            INNER JOIN position_level pl  
            ON cs.position_level_id = pl.id
            WHERE cs.id = positionId;
        
            mpath:=CONCAT(mpath,'.L',positionLevelNumber);
        
            RETURN mpath;
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE OR REPLACE PROCEDURE set_new_mpath()
        AS $$
        DECLARE
            teamId INTEGER;
            item INTEGER;
        BEGIN
        
            FOR item IN SELECT * FROM employee_position ep 
                WHERE ep.deleted_at IS NULL
                AND ep.company_structure_team_id IS NOT NULL
            LOOP
                UPDATE employee_position 
                SET mpath = (SELECT get_mpath_by_team_id((SELECT ep.company_structure_team_id FROM employee_position ep WHERE ep.id = item)))
                WHERE id = item;
            END LOOP;
        END;
        $$ LANGUAGE plpgsql;
        
        CALL set_new_mpath();
    `);
  }

  async down(): Promise<void> {}
}
