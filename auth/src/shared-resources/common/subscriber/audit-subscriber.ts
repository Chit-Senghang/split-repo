import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent
} from 'typeorm';
import { AuditBaseEntity } from '../../entity/audit-base.entity';
import { RequestContext } from '../../middleware/request';

@EventSubscriber()
export class AuditSubscriber
  implements EntitySubscriberInterface<AuditBaseEntity>
{
  listenTo() {
    return AuditBaseEntity;
  }

  async afterInsert(event: InsertEvent<any>) {
    const { entity, manager } = event;
    if (!entity.createdBy) {
      entity.createdBy = RequestContext.currentUser() ?? null;
      if (entity.createdBy) {
        await manager.save(entity);
      }
    }
  }

  async afterUpdate(event: UpdateEvent<any>) {
    const { entity, manager } = event;
    if (!entity.updatedBy) {
      entity.updatedBy = RequestContext.currentUser() ?? null;
      if (entity.updatedBy) {
        await manager.save(entity);
      }
    }
  }
}
