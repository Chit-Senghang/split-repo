import { MigrationInterface, QueryRunner } from 'typeorm';
import { currencies } from '../data/currencies';
import { Code } from '../../key-value/entity';
import { CodeEnum } from '../../key-value/ts/enums/code.enum';

export class seedCurrency1671508773184 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const code = queryRunner.manager.create(Code, { code: CodeEnum.CURRENCY });
    await queryRunner.manager.save(code);
    for (const data of currencies) {
      const value = data.name.replace(/'/g, "''");
      await queryRunner.query(`
        INSERT INTO "code_value" ("value","code_id","identifier","is_system_defined")
        VALUES ('${value}',${code.id},'${data.code}','${
          data.code === 'USD' || data.code === 'KHR'
        }')
      `);
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
