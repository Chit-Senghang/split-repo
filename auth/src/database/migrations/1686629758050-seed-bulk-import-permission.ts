import { MigrationInterface, QueryRunner } from 'typeorm';
import { BULK_IMPORT_DOCUMENT_PERMISSION } from '../../shared-resources/ts/enum/permission/employee/bulk-import-document.enum';

export class SeedBulkImportPermission1686629758050
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, 'BULK_IMPORT_DOCUMENT', (SELECT id FROM "permission" WHERE name = 'ADMIN'));
        `);

    await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = get_permission_mpath('ADMIN,BULK_IMPORT_DOCUMENT')
            WHERE name = 'BULK_IMPORT_DOCUMENT';
        `);

    for (const data in BULK_IMPORT_DOCUMENT_PERMISSION) {
      await queryRunner.query(`
            INSERT INTO "permission" (version, "name",parent_id)
            VALUES(2, '${data}', (SELECT id FROM "permission" WHERE name = 'BULK_IMPORT_DOCUMENT'));
        `);
      await queryRunner.query(`
            UPDATE
            "permission"
            SET
            mpath = (get_permission_mpath('ADMIN,BULK_IMPORT_DOCUMENT,${data}'))
            WHERE name = '${data}';
        `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
