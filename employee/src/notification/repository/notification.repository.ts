import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { Notification } from '../entities/notification.entity';
import { INotificationRepository } from './interface/notification.repository.interface';

@Injectable()
export class NotificationRepository
  extends RepositoryBase<Notification>
  implements INotificationRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(Notification));
  }
}
