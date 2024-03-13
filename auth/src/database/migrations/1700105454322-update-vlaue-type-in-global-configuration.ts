/* eslint-disable no-useless-escape */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateValueTypeInGlobalConfiguration1700105454322
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE global_configuration ALTER COLUMN value TYPE TEXT;
    `);

    await queryRunner.query(`
      UPDATE global_configuration SET "regex"  = '^([\w+-.%]+@[\w.-]+.[A-Za-z]{2,4})(,[\w+-.%]+@[\w.-]+.[A-Za-z]{2,4})*$',
                                  "message"  = 'Value must be an email address or separated by a comma if you have multiple values'
      WHERE "name" = 'email-notification';
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
