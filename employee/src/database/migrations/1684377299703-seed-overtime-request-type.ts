import { MigrationInterface, QueryRunner } from 'typeorm';
import { OvertimeTypeEnum } from '../../shared-resources/common/enum/overtime-type-enum';

const seedData = [
  {
    name: OvertimeTypeEnum.NORMAL,
    percentagePerHour: 150
  },
  {
    name: OvertimeTypeEnum.OFF_DAY,
    percentagePerHour: 200
  },
  {
    name: OvertimeTypeEnum.PUBLIC_HOLIDAY,
    percentagePerHour: 200
  },
  {
    name: OvertimeTypeEnum.NIGHT_SHIFT,
    percentagePerHour: 200
  }
] as const;

export class SeedOvertimeRequestType1684377299703
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    for (const data of seedData) {
      await queryRunner.query(`
          INSERT INTO "overtime_request_type" ("name", "percentage_per_hour")
          VALUES('${data.name}', '${data.percentagePerHour}')
      `);
    }
  }

  async down(): Promise<void> {
    return;
  }
}
