import { NotificationMessagePayload } from 'firebase-admin/lib/messaging/messaging-api';

export interface IFirebaseMessage {
  topic: string;
  notification: NotificationMessagePayload;
}

export interface SubscribeDto {
  token: string;
  topic: string;
}
