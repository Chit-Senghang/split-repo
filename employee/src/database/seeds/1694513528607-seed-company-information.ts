// eslint-disable-next-line no-irregular-whitespace
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCompanyInformation1694513528607 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    INSERT INTO company_information 
            (version,name_en,name_kh,address_en,address_kh,email_address)
    VALUES  (1,'KARANAK KOI CAFÉ PTE LTD','ការ៉ាណាក កយ កាហ្វេ ភីធីអី អិលធីឌី','11, STREET 315, SANGKAT BOEUNG KOK I, KHAN TOUL KORK, PHNOM PENH, KINGDOM OF CAMBODIA', 'ផ្ទះលេខ១១ ផ្លូវលេខ ៣១៥ សង្កាត់បឹងកក់១ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ ព្រះរាជាណាចក្រកម្ពុជា', 'info@karanakkoi.com');
    `);
  }

  async down(): Promise<void> {
    return;
  }
}
