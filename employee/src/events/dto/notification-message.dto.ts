import { NotificationEntityTypeEnum } from '../../notification/enum/notification-entity-type.enum';

export type NotificationMessage = {
  title: string;
  entityId: number;
  entityType: NotificationEntityTypeEnum;
  description?: string;
};
