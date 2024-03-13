import { MigrationInterface, QueryRunner } from 'typeorm';
import { CodeTypesEnum } from '../../key-value/ts/enums/permission.enum';

export class SeedEmployeeGenderAndEmployeeMaritalStatus1686724743434
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // add to table code
    await queryRunner.manager.query(`
      INSERT INTO
        code (
          code,
          is_system_defined
        )
        VALUES
        (
          '${CodeTypesEnum.GENDER}',
          true
        ),
        (
          '${CodeTypesEnum.MARITAL_STATUS}',
          true
        )
    `);

    // add to table code-value or key-value
    await queryRunner.manager.query(`
      INSERT INTO
        code_value (
          "value",
          is_system_defined,
          code_id,
          is_enabled
        )
      VALUES
        (
          'Male',
          true,
          (SELECT id FROM code c WHERE c.code = '${CodeTypesEnum.GENDER}'),
          true
        ),
        (
          'Female',
          true,
          (SELECT id FROM code c WHERE c.code = '${CodeTypesEnum.GENDER}'),
          true
        ),
        (
          'Single',
          true,
          (SELECT id FROM code c WHERE c.code = '${CodeTypesEnum.MARITAL_STATUS}'),
          true
        ),
        (
          'Married',
          true,
          (SELECT id FROM code c WHERE c.code = '${CodeTypesEnum.MARITAL_STATUS}'),
          true
        ),
        (
          'Divorced',
          true,
          (SELECT id FROM code c WHERE c.code = '${CodeTypesEnum.MARITAL_STATUS}'),
          true
        );
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
