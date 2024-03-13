import { MigrationInterface, QueryRunner } from 'typeorm';
import { DEFAULT_DATE_FORMAT } from '../../shared-resources/common/dto/default-date-format';

export class ChangeTyeColumnDateInPublicHoliday1692085348520
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // remove date duplicates
    await queryRunner.manager.query(`
        DELETE FROM
        public_holiday a
        USING public_holiday b
        WHERE
        a.id > b.id
        AND TO_CHAR(a."date", '${DEFAULT_DATE_FORMAT}') = TO_CHAR(b."date", '${DEFAULT_DATE_FORMAT}');
    `);

    // change type from timestamp to date
    await queryRunner.manager.query(`
        ALTER TABLE public_holiday
        ALTER COLUMN date
        TYPE date;
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
