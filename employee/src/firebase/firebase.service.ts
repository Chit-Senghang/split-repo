import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import * as cryptojs from 'cryptojs';
import { MessagingTopicResponse } from 'firebase-admin/lib/messaging/messaging-api';
import { GlobalConfigurationNameEnum } from '../shared-resources/common/enum/global-configuration-name.enum';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { GrpcService } from '../grpc/grpc.service';
import { IFirebaseMessage, SubscribeDto } from './dto/firebase-payload.dto';
import { TOPIC_PREFIX } from './dto/topic-prefix';

@Injectable()
export class FirebaseService {
  constructor(private readonly grpcService: GrpcService) {}

  private async initializeFirebase() {
    //encypted firebase config
    const firebaseProjectId =
      await this.grpcService.getGlobalConfigurationByName({
        name: GlobalConfigurationNameEnum.FIREBASE_PROJECT_ID
      });
    const firebasePrivateKey =
      await this.grpcService.getGlobalConfigurationByName({
        name: GlobalConfigurationNameEnum.FIREBASE_PRIVATE_KEY
      });
    const firebaseClientEmail =
      await this.grpcService.getGlobalConfigurationByName({
        name: GlobalConfigurationNameEnum.FIREBASE_CLIENT_EMAIL
      });
    //decrypted firebase config
    const decryptedFirebasePrivateKey = cryptojs.Crypto.DES.decrypt(
      firebasePrivateKey.value,
      firebasePrivateKey.name
    );
    !firebase.apps.length
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

  private getGlobalConfigurationNotification = async () => {
    return await this.grpcService.getGlobalConfigurationByName({
      name: `real-time-notification`
    });
  };

  async publicTopic(payload: IFirebaseMessage): Promise<string | undefined> {
    await this.initializeFirebase();
    try {
      const { isEnable } = await this.getGlobalConfigurationNotification();
      if (isEnable) {
        return await firebase.messaging().send(payload);
      }
    } catch (error) {
      throw new ResourceBadRequestException(error);
    }
  }

  async sendMessage(
    payload: IFirebaseMessage
  ): Promise<MessagingTopicResponse | undefined> {
    try {
      await this.initializeFirebase();
      const { isEnable } = await this.getGlobalConfigurationNotification();
      if (isEnable) {
        const { topic, notification }: IFirebaseMessage = payload;
        const response = await firebase
          .messaging()
          .sendToTopic(`${TOPIC_PREFIX.USER + topic}`, { notification });
        return response;
      }
    } catch (error) {
      throw new ResourceBadRequestException(error);
    }
  }

  async subscribeToTopic(payload: SubscribeDto) {
    await this.initializeFirebase();
    const { token, topic }: SubscribeDto = payload;
    const { isEnable } = await this.getGlobalConfigurationNotification();
    if (isEnable) {
      return await firebase
        .messaging()
        .subscribeToTopic(token, `${TOPIC_PREFIX.USER + topic}`)
        .then((response: any) => {
          return response;
        })
        .catch((error: any) => {
          throw new ResourceForbiddenException(error);
        });
    }
  }
}
