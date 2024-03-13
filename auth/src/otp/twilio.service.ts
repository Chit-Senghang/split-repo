import { Injectable, Logger } from '@nestjs/common';
import * as twilio from 'twilio';
import {} from 'twilio/lib/rest/api/v2010/account/message';
import { OtpTransporter } from './common/ts/interface/otp-transporter';

@Injectable()
export class TwilioService implements OtpTransporter {
  async sendOtp(otp: string, to: string) {
    try {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const tokenList = await client.messaging.services.list({ limit: 1 });
      let messagingServiceSid;

      if (tokenList.length === 0) {
        messagingServiceSid = await client.messaging.services.create({
          friendlyName: process.env.TWILIO_FRIENDLY_NAME
        });
      } else {
        messagingServiceSid = tokenList[0];
      }
      const link = 'https://www.khmer24.com/';
      await client.messages.create({
        body: `Hello here is your OTP ${otp} and link for verify ${link}`,
        from: process.env.TWILIO_PHONE_THEARITH,
        to: to,
        messagingServiceSid: messagingServiceSid.sid
      });
    } catch (error) {
      Logger.log('Error sending SMS:', error.message);
    }
  }
}
