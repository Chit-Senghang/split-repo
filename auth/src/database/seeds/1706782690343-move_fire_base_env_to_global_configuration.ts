import { MigrationInterface, QueryRunner } from 'typeorm';
import * as cryptojs from 'cryptojs';
import { GlobalConfigurationNameEnum } from '../../shared-resources/common/enum/global-configuration-name.enum';
import { GLOBAL_CONFIGURATION_DATATYPE } from '../../global-configuration/common/ts/enums/global-configuration-datatype.enum';

export class MoveFireBaseEnvToGlobalConfiguration1706782690343
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    //firebase config
    const firebaseType: string = 'service_account';
    const firebaseProjectId: string = 'koi-hrm-dev';
    const firebasePrivateKeyId: string =
      'fbe08b95ef34f4111b4517f789d98eb6122cd963';
    const fireBasePrivateKey: string =
      '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCfCwH44UOb7HXA\nJWAngHcXWPa/yJZkySuqh4YufTdo3BiiXvHtNEDdnxgfaVAPNHBA3eh/FxeONTIS\nNO2WeI46D4ls6s/zDLFBOqcr36KSXKuJNJIqKbUiXYniNY7OLiYYpOC0U358XDg5\nBPM4drExhARfkXkiGbyHTPsl3QmK1rySK1EqkdTIQAJN0g7PMq8jGDV1+tlq9QHT\n26V3ylQF6dYrcWqnJYFwziyY/QeBqA9KJ+4VGE2W8R7623uht38lg2TZHeilIqfB\nhh3XTB2Xq+nVnM1PWEUt69XJg8kDlUfkXoM3bkRF66dbub/AMHi7U6GtupvZYiyM\nNbLApiJxAgMBAAECggEAAd+M3QhlG7zFWBjYmbiwosQJNik/2JeBQ7SnqdkPKwQD\nLecj1ibxfzCR4s2OG2Qac9NSA89g0Y6c14wOaLLYzxifkdep0P8idMp/+QV/71WR\nXR0qZtVGvp6ag/iQ+ZNxB5xeoYnUCXg3JJWDV3+6wOuMsUYEXgzo0xmwYcWDiJ9b\nYT9wCobLrp30s7MIiQ4LcdUsD/vuHcUAn4VemHkhDxtas770KwSMdvkGhIDSPdCV\nEoe9fBY0z62Vvzd3ALr0vufnjgj+Tz7rUbApe3WnL5544xTNvGaGO5eVCHCerCVz\nOwGEp9dK/KMKvK5dtPa+7/9k2T/td1PfiObb9rNCZQKBgQDUFw9oMMuKwMQ56c7f\nRRYXY9p/TYHlGgN1Iv5MGi/yx9H35gtUG0vvTbGAQXF3iicxAXdy4XlB41ywuv9P\nYt0wkiSFRMJzB8rZYHQ0/VFr0f68eib5tu3Bjve2fLm5VSjagk/s9x8jyOSecJWe\nOZDvEyEldnzYk3UI2Ooc+ZwAPwKBgQC/+Gktk+xUO9KZI9n73TFCrOqndB7GGyXC\nTdscCIWUwA0yxvmjcdWU8vOJjhBV1qss6Cb+h8AnU6IRbKcBszatl7UhFZuIlv76\npfupuSG0dKhGnrS4CAD2JpFD/BLOF9iZfcmYqiaxcM6uj8it4iCzeBbUKN+zLdhK\nm462ZQoxTwKBgHHpHMZKBtg0JnAwaoKyOWZApDbhaxWgfiDotYosOnp75gLuFEGN\nE6CoquAGxil9EwWYEw6pmRXRRpRJKxz5LXGL3H+TaZico89SpbdcIuH0/ItAVDSk\nklf2MIdbv+iRm4qYmNLd+2Sd3mRWdZVwt64gKRpU5ELyF9azojIDwkzDAoGASYpO\nMImkVTh9mvDjBttbjaFUW0XerCGmO2M79udE1RElfThAVd675U2VAjMMCvYrqQ5e\nMc+rSuV9BpPK/pm67pFZcA0pAhBmKXsAh6pGQS0XccZGkOFwDNwFdjfQtGbqMRLA\n8dzs6bi/VJv8UrB3uojcpfXqjGeZnistZq4aU30CgYBRLknXIIXaSvFWw1qB5KKg\nRWhcQ+QfREFkoKan0iH0iy6fLfHxqYfvwRNFArkJObJH5I5oKmpA/uU2qHgszRtK\nP/+LaerRGkQSLJc5ak2QXkO9G1hvFJVUHCxAPpUXn85J6X7QK24M9CgQaDOXUYZf\nYvhhNaBd1N0PUjFgPTMhbw==\n-----END PRIVATE KEY-----\n';
    const firebaseClientEmail: string =
      'firebase-adminsdk-e02xs@koi-hrm-dev.iam.gserviceaccount.com';
    const firebaseClientId: string = '105175331976743763436';
    const firebaseJWTExpire: string = '24h';

    //encrypted firebase config
    const encryptedFirebasePrivateKeyId: string = cryptojs.Crypto.DES.encrypt(
      firebasePrivateKeyId,
      GlobalConfigurationNameEnum.FIREBASE_PRIVATE_KEY_ID
    );
    const encryptedFireBasePrivateKey: string = cryptojs.Crypto.DES.encrypt(
      fireBasePrivateKey,
      GlobalConfigurationNameEnum.FIREBASE_PRIVATE_KEY
    );
    const encryptedFirebaseClientId: string = cryptojs.Crypto.DES.encrypt(
      firebaseClientId,
      GlobalConfigurationNameEnum.FIREBASE_CLIENT_ID
    );

    await queryRunner.query(`
      ALTER TYPE config_type ADD VALUE IF NOT EXISTS 'FIREBASE';
      COMMIT;

      INSERT INTO global_configuration (version, name, is_enable, value, type, data_type)
      VALUES 
      (1, '${GlobalConfigurationNameEnum.FIREBASE_TYPE}', false, '${firebaseType}', 'FIREBASE', '${GLOBAL_CONFIGURATION_DATATYPE.TEXT}'),
      (1, '${GlobalConfigurationNameEnum.FIREBASE_PROJECT_ID}', false, '${firebaseProjectId}', 'FIREBASE', '${GLOBAL_CONFIGURATION_DATATYPE.TEXT}'),
      (1, '${GlobalConfigurationNameEnum.FIREBASE_PRIVATE_KEY_ID}', false, '${encryptedFirebasePrivateKeyId}', 'FIREBASE', '${GLOBAL_CONFIGURATION_DATATYPE.PASSWORD}'),
      (1, '${GlobalConfigurationNameEnum.FIREBASE_PRIVATE_KEY}', false, '${encryptedFireBasePrivateKey}', 'FIREBASE', '${GLOBAL_CONFIGURATION_DATATYPE.PASSWORD}'),
      (1, '${GlobalConfigurationNameEnum.FIREBASE_CLIENT_EMAIL}', false, '${firebaseClientEmail}', 'FIREBASE', '${GLOBAL_CONFIGURATION_DATATYPE.TEXT}'),
      (1, '${GlobalConfigurationNameEnum.FIREBASE_CLIENT_ID}', false, '${encryptedFirebaseClientId}', 'FIREBASE', '${GLOBAL_CONFIGURATION_DATATYPE.PASSWORD}'),
      (1, '${GlobalConfigurationNameEnum.FIREBASE_JWT_EXPIRE}', false, '${firebaseJWTExpire}', 'FIREBASE', '${GLOBAL_CONFIGURATION_DATATYPE.TEXT}');

      UPDATE 
          global_configuration 
      SET 
          is_enable = false,
          type = 'FIREBASE'
      WHERE 
          name = '${GlobalConfigurationNameEnum.REAL_TIME_NOTIFICATION}';
    `);
  }

  public async down(): Promise<void> {}
}
