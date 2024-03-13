import * as cryptojs from 'cryptojs';
import { DecryptInterface } from '../common/interface/util-interface';

export const validateDecrypt = (option: DecryptInterface) => {
  let decryptValue: string;
  try {
    const decryptValueExist = cryptojs.Crypto.DES.decrypt(
      option.value,
      option.key
    );
    if (decryptValueExist) {
      decryptValue = decryptValueExist;
    }
  } catch (e) {
    decryptValue = '';
  }

  return decryptValue ?? '';
};
