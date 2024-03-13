import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSomePermissionToRoleEssUser1702632388344
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    const ssuPermission = await queryRunner.query(
      `
      SELECT id, name
      FROM "permission" 
      WHERE "name" IN(
            'EMPLOYEE',
            'READ_EMPLOYEE_BIRTHDAY_REPORT',
            'READ_EMPLOYEE_POST_PROBATION_REPORT',
            'READ_EMPLOYEE_WORK_ANNIVERSARY_REPORT',
            'ATTENDANCE',
            'READ_REPORT_EMPLOYEE_ATTENDANCE'
      );`
    );

    for (const permission of ssuPermission) {
      await queryRunner.query(
        `INSERT INTO "role_permission" 
                   ("version", "role_id", "permission_id", updated_by, created_by, created_at, updated_at, deleted_at) 
            VALUES (1,
                    (SELECT id
                    FROM "role"
                    WHERE name = 'ESS User' AND is_system_defined = TRUE),
                    ${permission.id}, NULL, NULL, NOW(), NOW(), NULL);`
      );
    }
  }

  down(): Promise<void> {
    return;
  }
}
