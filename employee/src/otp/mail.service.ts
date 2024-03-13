import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { OtpTransporter } from './common/ts/interface/otp-transporter';

@Injectable()
export class MailService implements OtpTransporter {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendOtp(msg: string, to: string) {
    const isError = true;
    try {
      const result = await this.mailerService.sendMail({
        to: to,
        subject: 'Welcome to KOI ',
        template: './confirmation',
        context: {
          msg
        },
        html: msg
      });
      this.logger.debug(`Email sent: ${result.messageId}`);
      return result;
    } catch (error) {
      Logger.log(error);
      return { error, isError };
    }
  }
}
