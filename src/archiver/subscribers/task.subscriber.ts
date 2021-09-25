import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Task } from '../models/task.model';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventSubscriber()
export class TaskSubscriber implements EntitySubscriberInterface<Task> {
  constructor(connection: Connection, private eventEmitter: EventEmitter2) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Task;
  }

  afterUpdate(event: UpdateEvent<Task>) {
    this.eventEmitter.emit('task.updated', event.entity);
  }

  afterInsert(event: InsertEvent<Task>) {
    this.eventEmitter.emit('task.added', event.entity);
  }
}
