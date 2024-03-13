import { MigrationInterface, QueryRunner } from 'typeorm';

export class addContraintToAuditLog1674916428246 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "audit_log"
        ADD COLUMN "updated_by" INTEGER NULL;
        ALTER TABLE "audit_log"
        ADD COLUMN "updated_at" TIMESTAMP;
        ALTER TABLE "audit_log"
        ADD COLUMN "deleted_at" TIMESTAMPTZ;
        ALTER TABLE "audit_log"
        ADD CONSTRAINT "fk_user_id_updated_by" FOREIGN KEY ("updated_by") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    `);
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
        VALUES(2, 'AUDIT_LOG', (SELECT id FROM "permission" WHERE name = 'AUTHENTICATION_MODULE'));
    `);

    await queryRunner.query(`
    UPDATE
    "permission"
    SET
    mpath = get_permission_mpath('AUTHENTICATION_MODULE,AUDIT_LOG')
    WHERE name = 'AUDIT_LOG';
`);

    await queryRunner.query(`
    INSERT INTO "permission" (version, "name",parent_id)
    VALUES(2, 'READ_AUDIT_LOG', (SELECT id FROM "permission" WHERE name = 'AUDIT_LOG'));
`);
    await queryRunner.query(`
    UPDATE
    "permission"
    SET
    mpath = (get_permission_mpath('AUTHENTICATION_MODULE,AUDIT_LOG,READ_AUDIT_LOG'))
    WHERE name = 'READ_AUDIT_LOG';
`);
  }

  async down(): Promise<void> {
    return;
  }
}
