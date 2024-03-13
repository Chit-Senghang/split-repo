import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStrongPasswordMessage1699501032943
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        UPDATE global_configuration 
            SET description = 'Password requires at least one uppercase letter, one lowercase letter, one number, and one special character.' 
        WHERE name = 'enable-strong-password';
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
