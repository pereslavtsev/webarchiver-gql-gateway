import { Inject, Injectable } from '@nestjs/common';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { ClientGrpc } from '@nestjs/microservices';
import { GrpcClientProvider } from '../../shared';
import { OnTask } from '../tasks.decorators';
import { Task } from '../models';
import { Metadata } from '@grpc/grpc-js';
import { Source } from '../../sources/models';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { catchError, map } from 'rxjs';
import { InjectPubSub } from '../../pubsub';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { plainToClass } from 'class-transformer';

@Injectable()
export class TaskListener extends GrpcClientProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @Inject('webarchiver') client: ClientGrpc,
    @InjectPubSub() private pubsub: RedisPubSub,
    private eventEmitter: EventEmitter2,
  ) {
    super(rootLogger, client);
  }

  private createTaskLogger(task: Task) {
    return this.log.child({ reqId: `task_${task.id}` });
  }

  private async subscribeTask(task: Task): Promise<void> {
    const { status } = task;

    switch (status) {
      case Task.Status.MATCHED: {
        this.eventEmitter.emit('task.matched', task);
        break;
      }
      case Task.Status.ACCEPTED: {
        this.eventEmitter.emit('task.accepted', task);
        break;
      }
      case Task.Status.SKIPPED: {
        this.eventEmitter.emit('task.skipped', task);
      }
    }

    const xxx = plainToClass(Task, task, { groups: ['graphql'] });
    console.log('xxx', xxx)
    await this.pubsub.publish('taskUpdated', {
      taskUpdated: xxx,
    });
  }

  @OnTask.Created()
  handleTaskCreatedEvent(task: Task) {
    const log = this.createTaskLogger(task);
    this.tasksService
      .getTaskStream({ id: task.id }, new Metadata())
      .pipe(
        map(this.subscribeTask.bind(this)),
        catchError((err, caught) => {
          log.error(err);
          return err;
        }),
      )
      .subscribe(
        null,
        (err) => log.error(err),
        () => log.debug(`task stream completed`),
      );
  }

  @OnTask.Accepted()
  handleTaskAcceptedEvent(task: Task) {
    const log = this.createTaskLogger(task);
    log.debug('task was accepted');
    this.sourcesService
      .getSourcesStream({ taskId: task.id }, new Metadata())
      .subscribe((source) => {
        const { status } = source;
        switch (status) {
          case Source.Status.PENDING: {
            this.eventEmitter.emit('source.received', source);
            break;
          }
          case Source.Status.MATCHED: {
            this.eventEmitter.emit('source.matched', source);
            break;
          }
        }
      });
  }

  @OnTask.Matched()
  handleTaskMatchedEvent(task: Task) {
    const log = this.createTaskLogger(task);
    log.debug('task was matched');
  }

  @OnTask.Skipped()
  handleTaskSkippedEvent(task: Task) {
    const log = this.createTaskLogger(task);
    log.debug('task was skipped');
  }
}
