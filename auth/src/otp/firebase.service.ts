import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import * as cryptojs from 'cryptojs';
import { GlobalConfigurationNameEnum } from '../shared-resources/common/enum/global-configuration-name.enum';
import { GlobalConfigurationService } from '../global-configuration/global-configuration.service';

@Injectable()
export class FirebaseService {
  constructor(
    private readonly globalConfiguarationService: GlobalConfigurationService
  ) {}

  private async initializeFirebase() {
    //encypted firebase config
    const firebaseProjectId =
      await this.globalConfiguarationService.findOneByName(
        GlobalConfigurationNameEnum.FIREBASE_PROJECT_ID
      );
    const firebasePrivateKey =
      await this.globalConfiguarationService.findOneByName(
        GlobalConfigurationNameEnum.FIREBASE_PRIVATE_KEY
      );
    const firebaseClientEmail =
      await this.globalConfiguarationService.findOneByName(
        GlobalConfigurationNameEnum.FIREBASE_CLIENT_EMAIL
      );
    //decrypted firebase config
    const decryptedFirebasePrivateKey = cryptojs.Crypto.DES.decrypt(
      firebasePrivateKey.value,
      firebasePrivateKey.name
    );
    Logger.log('Firebase init success');
    return !firebase.apps.length
      ? firebase.initializeApp({
          projectId: firebaseProjectId.value,
          credential: firebase.credential.cert({
            projectId: firebaseProjectId.value,
            privateKey: decryptedFirebasePrivateKey.replace(/\\n/g, '\n'),
            clientEmail: firebaseClientEmail.value
          })
        })
      : firebase.app();
  }

  async verifyFirebaseToken(accessToken: string) {
    try {
      const firebaseUser = await this.initializeFirebase();
      firebaseUser.auth().verifyIdToken(accessToken);
      return firebaseUser;
    } catch (error) {
      Logger.log(error);
      throw new UnauthorizedException();
    }
  }
}
