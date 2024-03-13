import { MigrationInterface, QueryRunner } from 'typeorm';

export class PermisssionSeeder1684117290585 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    insert into "permission" ("name", "version")
    values ('META_DATA_MODULE', 1);

    update "permission"
    set mpath = get_permission_mpath('META_DATA_MODULE')
    where "name" = 'META_DATA_MODULE';

    update "permission" 
    set "name" = 'ADMIN'
    where "name" = 'AUTHENTICATION_MODULE';

    insert into "permission" ("name", "version")
    values ('EMPLOYEE_MANAGEMENT', 1);

    update "permission"
    set mpath = get_permission_mpath('META_DATA_MODULE,EMPLOYEE_MANAGEMENT'), parent_id = (select id from "permission" where "name"= 'META_DATA_MODULE')
    where "name" = 'EMPLOYEE_MANAGEMENT';

    update "permission" 
    set mpath = get_permission_mpath('META_DATA_MODULE,EMPLOYEE_MANAGEMENT,KEY_VALUE'), parent_id = (select id from "permission" where "name"= 'EMPLOYEE_MANAGEMENT')
    where name = 'KEY_VALUE';

    update "permission" 
    set mpath = replace(mpath, 
    concat((select id from "permission" where "name"= 'EMPLOYEE_MODULE'), '.'), 
    concat((select id from "permission" where "name"= 'META_DATA_MODULE'), '.', (select id from "permission" where "name"= 'EMPLOYEE_MANAGEMENT'),'.'))
    where name like '%CODE_VALUE';

    update "permission" 
    set mpath = get_permission_mpath('META_DATA_MODULE,EMPLOYEE_MANAGEMENT,WORKING_SHIFT'), parent_id = (select id from "permission" where "name"= 'EMPLOYEE_MANAGEMENT')
    where name = 'WORKING_SHIFT';

    update "permission" 
    set mpath = regexp_replace(mpath, 
    concat('^',(select id from "permission" where "name"= 'EMPLOYEE_MODULE'), '.'), 
    concat((select id from "permission" where "name"= 'META_DATA_MODULE'), '.', (select id from "permission" where "name"= 'EMPLOYEE_MANAGEMENT'),'.'))
    where name like '%WORKING_SHIFT';

    update "permission" 
    set mpath = get_permission_mpath('META_DATA_MODULE,EMPLOYEE_MANAGEMENT,WORKSHIFT_TYPE'), parent_id = (select id from "permission" where "name"= 'EMPLOYEE_MANAGEMENT')
    where name = 'WORKSHIFT_TYPE';

    update "permission" 
    set mpath = regexp_replace(mpath, 
    concat('^',(select id from "permission" where "name"= 'EMPLOYEE_MODULE'), '.'), 
    concat((select id from "permission" where "name"= 'META_DATA_MODULE'), '.', (select id from "permission" where "name"= 'EMPLOYEE_MANAGEMENT'),'.'))
    where name like '%WORKSHIFT_TYPE';

    update "permission" 
    set mpath = get_permission_mpath('META_DATA_MODULE,EMPLOYEE_MANAGEMENT,GEOGRAPHIC'), parent_id = (select id from "permission" where "name"= 'EMPLOYEE_MANAGEMENT')
    where name = 'GEOGRAPHIC';

    update "permission" 
    set mpath = regexp_replace(mpath, 
    concat('^',(select id from "permission" where "name"= 'EMPLOYEE_MODULE'), '.'), 
    concat((select id from "permission" where "name"= 'META_DATA_MODULE'), '.', (select id from "permission" where "name"= 'EMPLOYEE_MANAGEMENT'),'.'))
    where name like '%GEOGRAPHIC';

    update "permission" 
    set mpath = get_permission_mpath('META_DATA_MODULE,EMPLOYEE_MANAGEMENT,INSURANCE'), parent_id = (select id from "permission" where "name"= 'EMPLOYEE_MANAGEMENT')
    where name = 'INSURANCE';

    update "permission" 
    set mpath = regexp_replace(mpath, 
    concat('^',(select id from "permission" where "name"= 'EMPLOYEE_MODULE'), '.'), 
    concat((select id from "permission" where "name"= 'META_DATA_MODULE'), '.', (select id from "permission" where "name"= 'EMPLOYEE_MANAGEMENT'),'.'))
    where name like 'READ_INSURANCE';

    update "permission" 
    set mpath = regexp_replace(mpath, 
    concat('^',(select id from "permission" where "name"= 'EMPLOYEE_MODULE'), '.'), 
    concat((select id from "permission" where "name"= 'META_DATA_MODULE'), '.', (select id from "permission" where "name"= 'EMPLOYEE_MANAGEMENT'),'.'))
    where name like 'CREATE_INSURANCE';

    update "permission" 
    set mpath = regexp_replace(mpath, 
    concat('^',(select id from "permission" where "name"= 'EMPLOYEE_MODULE'), '.'), 
    concat((select id from "permission" where "name"= 'META_DATA_MODULE'), '.', (select id from "permission" where "name"= 'EMPLOYEE_MANAGEMENT'),'.'))
    where name like 'UPDATE_INSURANCE';

    update "permission" 
    set mpath = regexp_replace(mpath, 
    concat('^',(select id from "permission" where "name"= 'EMPLOYEE_MODULE'), '.'), 
    concat((select id from "permission" where "name"= 'META_DATA_MODULE'), '.', (select id from "permission" where "name"= 'EMPLOYEE_MANAGEMENT'),'.'))
    where name like 'DELETE_INSURANCE';
`);
  }

  public async down(): Promise<void> {
    return;
  }
}
