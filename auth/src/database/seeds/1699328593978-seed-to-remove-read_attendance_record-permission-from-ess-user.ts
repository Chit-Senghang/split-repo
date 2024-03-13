import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedToRemoveReadAttendanceRecordPermissionFromEssUser1699328593978
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM
                role_permission rp
            WHERE
                rp.role_id = (SELECT id FROM "role" r WHERE r.name = 'ESS User' AND r.is_system_defined = true)
            AND 
                rp.permission_id = (SELECT id FROM "permission" p WHERE p.name = 'READ_ATTENDANCE_RECORD')
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
