import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cryptojs from 'cryptojs';
import { HttpStatusCodeMekong } from '../shared-resources/common/utils/http-status-code';
import { GlobalConfigurationService } from '../global-configuration/global-configuration.service';
import { GlobalConfigurationNameEnum } from '../shared-resources/common/enum/global-configuration-name.enum';

@Injectable()
export class MekongService {
  constructor(
    private readonly globalConfigurationService: GlobalConfigurationService
  ) {}

  async sendOtp(smsText: string, gsm: string) {
    try {
      const {
        SMS_SERVER_URL,
        SMS_USERNAME,
        SMS_PASSWORD,
        SMS_SENDER,
        SMS_IN,
        SMS_CUSTOM_DATA
      } = GlobalConfigurationNameEnum;
      const { value: smsServerUrl } =
        await this.globalConfigurationService.findOneByName(SMS_SERVER_URL);

      const { value: username } =
        await this.globalConfigurationService.findOneByName(SMS_USERNAME);

      const { value: passwordValue, name: passwordKey } =
        await this.globalConfigurationService.findOneByName(SMS_PASSWORD);
      const password = cryptojs.Crypto.DES.decrypt(passwordValue, passwordKey);

      const { value: sender } =
        await this.globalConfigurationService.findOneByName(SMS_SENDER);

      const { value: mekongIn } =
        await this.globalConfigurationService.findOneByName(SMS_IN);

      const { value: cd } =
        await this.globalConfigurationService.findOneByName(SMS_CUSTOM_DATA);

      const endPoint = `${smsServerUrl}?username=${username}&pass=${password}&cd=${cd}&sender=${sender}&smstext=${smsText}&gsm=${gsm}&int=${mekongIn}`;
      const otp = await axios.post(endPoint, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const responseMessage = '0 [Success]';
      if (otp.data) {
        if (otp.data.includes(responseMessage)) {
          return HttpStatusCodeMekong.Ok;
        } else if (
          otp.data.includes(HttpStatusCodeMekong.AccountHasAPIAccess)
        ) {
          return HttpStatusCodeMekong.AccountHasAPIAccess;
        }
      }
    } catch (e) {
      Logger.log(e);
    }
  }
}
