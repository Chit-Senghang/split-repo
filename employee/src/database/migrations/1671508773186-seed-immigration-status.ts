import { MigrationInterface, QueryRunner } from 'typeorm';
import { Code } from '../../key-value/entity/code.entity';
import { CodeEnum } from '../../key-value/ts/enums/code.enum';

export class seedImmigrationStatus1671508773186 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const code = queryRunner.manager.create(Code, {
      code: CodeEnum.IMMIGRATION_STATUS
    });
    await queryRunner.manager.save(code);
    const immigrationStatus = [
      {
        name: 'Citizen'
      },
      {
        name: 'Permanent Resident'
      },
      {
        name: 'Work Permit Holder'
      },
      {
        name: 'Dependent Pass Holder'
      }
    ];
    for (const data of immigrationStatus) {
      const value = data.name.replace(/'/g, "''");
      await queryRunner.query(`
        INSERT INTO "code_value" ("value","code_id","is_system_defined")
        VALUES ('${value}',${code.id},'${true}')
      `);
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
