import { join } from 'path';
import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EnvironmentModule } from '../config/environment.module';
import { EnvironmentService } from '../config/environment.service';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [EnvironmentModule],
      useFactory: async (environmentService: EnvironmentService) => ({
        transport: {
          host: environmentService.getStringValue('MAIL_HOST'),
          port: environmentService.getNumberValue('MAIL_PORT'),
          ignoreTLS: true,
          secure: true,
          auth: {
            user: environmentService.getStringValue('MAIL_USER'),
            pass: environmentService.getStringValue('MAIL_PASS')
          }
        },
        preview: false,
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
          options: {
            strict: true
          }
        }
      }),
      inject: [EnvironmentService]
    })
  ],
  providers: [MailService],
  exports: [MailService]
})
export class OtpModule {}
