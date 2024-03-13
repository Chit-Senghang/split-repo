import { MigrationInterface, QueryRunner } from 'typeorm';
import { Code } from '../../key-value/entity';
import { CodeEnum } from '../../key-value/ts/enums/code.enum';
import { data } from '../data/countries';

export class seedNationality1671508773185 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const code = queryRunner.manager.create(Code, {
      code: CodeEnum.NATIONALITY
    });
    await queryRunner.manager.save(code);

    let codeValueSql = '';

    data.map((country) => {
      codeValueSql += `INSERT INTO code_value(code_id, value, identifier)
       VALUES(${code.id}, '${country.demonym}', '${country.demonym}') ON CONFLICT DO NOTHING; `;
    });

    await queryRunner.query(codeValueSql);
  }

  public async down(): Promise<void> {
    return;
  }
}
