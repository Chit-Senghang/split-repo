import { Logger } from '@nestjs/common';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  LoadEvent,
  InsertEvent,
  UpdateEvent,
  RemoveEvent
} from 'typeorm';
import { RequestContext } from './request';

@EventSubscriber()
export class AuditEntitySubscriber implements EntitySubscriberInterface {
  private loadCount: number;

  constructor() {
    this.loadCount = 1;
  }

  async afterInsert(event: InsertEvent<any>): Promise<any> {
    const { manager, entity } = event;
    const data = RequestContext.currentRequestContext() || null;
    const userId = RequestContext.currentUser() || null;
    const requestBody: string = JSON.stringify(data.request.body);
    await manager.queryRunner.query(
      `INSERT INTO  "audit_log"
          (
            request_method,
            request_url,
            request_json,
            ip_address,
            resource_id,
            created_by
          )
          VALUES
          (
            '${data.request.method}',
            '${data.request.url}',
            '${requestBody}',
            '${data.request.headers['x-forwarded-for']}',
            '${entity['id']}',
            '${userId}'
          )`
    );
  }

  async afterUpdate(event: UpdateEvent<any>): Promise<any> {
    const { manager, entity } = event;
    const data = RequestContext.currentRequestContext() || null;
    const userId = RequestContext.currentUser() || null;
    const requestBody: string = JSON.stringify(data.request.body);
    await manager.queryRunner.query(
      `INSERT INTO  "audit_log"
          (
            request_method,
            request_url,
            request_json,
            ip_address,
            resource_id,
            created_by
          )
          VALUES
          (
            '${data.request.method}',
            '${data.request.url}',
            '${requestBody}',
            '${data.request.headers['x-forwarded-for']}',
            '${entity['id']}',
            '${userId}'
          )`
    );
  }

  async afterRemove(event: RemoveEvent<any>): Promise<any> {
    const { manager } = event;
    const data = RequestContext.currentRequestContext() || null;
    const userId = RequestContext.currentUser() || null;
    const requestBody: string = JSON.stringify(data.request.body);
    await manager.queryRunner.query(
      `INSERT INTO  "audit_log"
          (
            request_method,
            request_url,
            request_json,
            ip_address,
            created_by
          )
          VALUES
          (
            '${data.request.method}',
            '${data.request.url}',
            '${requestBody}',
            '${data.request.headers['x-forwarded-for']}',
            '${userId}'
          )`
    );
  }

  async afterLoad(entity: any, event?: LoadEvent<any>): Promise<any> {
    const { manager } = event;
    if (event.manager.connection.driver.database === 'hrm_authentication') {
      const header =
        RequestContext.currentRequestContext().request.method || null;
      const data = RequestContext.currentRequestContext() || null;
      const userId = RequestContext.currentUser() || null;
      const requestBody: string = JSON.stringify(data.request.body);
      if (header !== 'GET') {
        return;
      }
      if (this.loadCount !== 1) {
        return;
      }
      this.loadCount += 1;
      try {
        await manager.queryRunner.query(
          `INSERT INTO  "audit_log"
              (
                request_method,
                request_url,
                request_json,
                ip_address,
                created_by
              )
              VALUES
              (
                '${data.request.method}',
                '${data.request.url}',
                '${requestBody}',
                '${data.request.headers['x-forwarded-for']}',
                '${userId}'
              )`
        );
        this.loadCount = 1;
      } catch (error) {
        Logger.log(error);
      }
    }
    return;
  }
}
