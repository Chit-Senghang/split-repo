import { MigrationInterface, QueryRunner } from 'typeorm';

export class createFunction1671672067455 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE FUNCTION get_permission_mpath(permission_names TEXT) RETURNS TEXT AS $$ 
        DECLARE
            names TEXT[];
            permission_name TEXT;
            return_result TEXT;
            permission_id INT;
        BEGIN
            names = string_to_array(permission_names,',');

            FOREACH permission_name IN array names LOOP
            SELECT id FROM "permission" p WHERE p."name" = permission_name INTO permission_id;
            return_result:=concat(return_result, concat(permission_id, '.'));
            end loop;

            RETURN return_result;
        END $$ LANGUAGE plpgsql;
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
