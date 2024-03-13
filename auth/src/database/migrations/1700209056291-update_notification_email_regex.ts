import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNotificationEmailRegex1700209056291
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
    UPDATE global_configuration SET "regex"  = '^(\\s?[^\\s,]+@[^\\s,]+\\.[^\\s,]+\\s?,)*(\\s?[^\\s,]+@[^\\s,]+\\.[^\\s,]+)$',
        "message"  = 'Value must be an email address or separated by a comma if you have multiple values'
    WHERE "name" = 'email-notification';
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
