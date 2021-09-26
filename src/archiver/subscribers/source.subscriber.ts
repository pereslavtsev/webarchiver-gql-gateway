import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Source } from '../models/source.model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SourceStatus } from '../enums/source-status.enum';

@EventSubscriber()
export class SourceSubscriber implements EntitySubscriberInterface<Source> {
  constructor(connection: Connection, private eventEmitter: EventEmitter2) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Source;
  }

  async afterUpdate(event: UpdateEvent<Source>) {
    this.eventEmitter.emit('source.updated', event.entity);
    switch (event.entity.status) {
      case SourceStatus.ARCHIVED: {
        this.eventEmitter.emit('source.archived', event.entity);
      }
    }
  }

  async afterInsert(event: InsertEvent<Source>) {
    this.eventEmitter.emit('source.added', event.entity);
  }
}
