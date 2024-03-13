import { MigrationInterface, QueryRunner } from 'typeorm';
import { SepcialModule } from '../../shared-resources/permission/special.permission';

export class seedRoleData1659607614124 implements MigrationInterface {
  name?: string;

  public async up(queryRunner: QueryRunner): Promise<void> {
    const admin = await queryRunner.query(
      `INSERT INTO public."role" (id, "version", "name", description, updated_by, created_by, created_at, updated_at, deleted_at) 
      VALUES(DEFAULT, 1, 'Admin', 'manage everything has full control', NULL, NULL, now(), now(), NULL) RETURNING id;`
    );

    const adminPermission = await queryRunner.query(
      `SELECT id FROM public."permission" where "name" = '${SepcialModule[0].default.admin}';`
    );
    await queryRunner.query(
      `INSERT INTO public."role_permission" 
      (id, "version", "role_id", "permission_id", updated_by, created_by, created_at, updated_at, deleted_at) 
      VALUES(DEFAULT, 1,${admin[0].id},${adminPermission[0].id}, NULL, NULL, now(), now(), NULL);`
    );

    const user = await queryRunner.query(
      `INSERT INTO public."role" (id, "version", "name", description, updated_by, created_by, created_at, updated_at, deleted_at)
     VALUES(DEFAULT, 1, 'User', 'normal service user', NULL, NULL, now(), now(), NULL) RETURNING id;
    `
    );

    const userPermission = await queryRunner.query(
      `SELECT id FROM public."permission" where "name" = '${SepcialModule[0].default.user}';`
    );

    await queryRunner.query(
      `INSERT INTO public."role_permission" 
      (id, "version", "role_id", "permission_id", updated_by, created_by, created_at, updated_at, deleted_at) 
      VALUES(DEFAULT, 1,${user[0].id},${userPermission[0].id}, NULL, NULL, now(), now(), NULL);`
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
