import { Logger } from '@nestjs/common';
import axios from 'axios';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserKongV21688647408451 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    try {
      const kongHost = process.env.KONG_URI;
      // Query all users
      const users = await _queryRunner.query(`SELECT * FROM public."user"`);
      // Insert each users
      for (const user of users) {
        const resp = await axios.post(`${kongHost}/consumers/`, {
          username: user.username,
          // eslint-disable-next-line camelcase
          custom_id: String(user.id)
        });

        await _queryRunner.query(`
                UPDATE public."user_consumer"
                SET "consumer_id" = ${resp.data.id}
                WHERE "user_id" = ${user.id}
            `);
      }
    } catch (err) {
      Logger.log(err);
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
