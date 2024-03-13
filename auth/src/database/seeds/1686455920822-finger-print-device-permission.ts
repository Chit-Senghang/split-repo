import { MigrationInterface, QueryRunner } from 'typeorm';

export class FingerPrintDevicePermission1686455920822
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`  insert into "permission" ("name", "version")
    values ('FINGER_PRINT_DEVICE', 1);

    insert into "permission" ("name", "version")
    values ('READ_FINGER_PRINT_DEVICE', 1);

    insert into "permission" ("name", "version")
    values ('UPDATE_FINGER_PRINT_DEVICE', 1);

    insert into "permission" ("name", "version")
    values ('CREATE_FINGER_PRINT_DEVICE', 1);

    insert into "permission" ("name", "version")
    values ('DELETE_FINGER_PRINT_DEVICE', 1);

    update "permission"
    set mpath = get_permission_mpath('ADMIN,FINGER_PRINT_DEVICE')
    where "name" = 'FINGER_PRINT_DEVICE';

    update "permission"
    set mpath = get_permission_mpath('ADMIN,FINGER_PRINT_DEVICE,READ_FINGER_PRINT_DEVICE')
    where "name" = 'READ_FINGER_PRINT_DEVICE';

    update "permission"
    set mpath = get_permission_mpath('ADMIN,FINGER_PRINT_DEVICE,UPDATE_FINGER_PRINT_DEVICE')
    where "name" = 'UPDATE_FINGER_PRINT_DEVICE';

    update "permission"
    set mpath = get_permission_mpath('ADMIN,FINGER_PRINT_DEVICE,CREATE_FINGER_PRINT_DEVICE')
    where "name" = 'CREATE_FINGER_PRINT_DEVICE';

    update "permission"
    set mpath = get_permission_mpath('ADMIN,FINGER_PRINT_DEVICE,DELETE_FINGER_PRINT_DEVICE')
    where "name" = 'DELETE_FINGER_PRINT_DEVICE';
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
