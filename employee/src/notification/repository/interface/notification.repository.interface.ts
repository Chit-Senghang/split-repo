import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { Notification } from '../../entities/notification.entity';

export interface INotificationRepository
  extends IRepositoryBase<Notification> {}
