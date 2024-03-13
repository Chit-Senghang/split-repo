/* eslint-disable no-useless-escape */
import { MigrationInterface, QueryRunner } from 'typeorm';
import { CodeEnum } from '../../key-value/ts/enums/code.enum';
import { data } from '../data/countries';
import { Code } from '../../key-value/entity';

export class seedCountries1671508773183 implements MigrationInterface {
  down(): Promise<any> {
    return;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const code = queryRunner.manager.create(Code, { code: CodeEnum.COUNTRY });
    await queryRunner.manager.save(code);
    data.forEach(async (data) => {
      // eslint-disable-next-line prettier/prettier
      const value = data.name.replace(/'/g, "''");
      await queryRunner.query(`
        INSERT INTO "code_value" ("value","code_id")
        VALUES ('${value}',${code.id})
      `);
    });
  }
}
