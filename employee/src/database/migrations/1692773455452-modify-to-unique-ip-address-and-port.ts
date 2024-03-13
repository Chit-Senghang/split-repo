import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyToUniqueIpAddressAndPort1692773455452
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(`
        ALTER TABLE fingerprint_device
        DROP CONSTRAINT unique_ip_address;
        
        ALTER TABLE fingerprint_device
        ADD CONSTRAINT "unique_ip_address_port" UNIQUE ("ip_address", "port");
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
