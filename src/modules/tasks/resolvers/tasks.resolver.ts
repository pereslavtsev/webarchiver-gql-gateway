import { Args, Resolver, Mutation, Query } from '@nestjs/graphql';
import { Task } from '../models';
import { CreateTaskDto } from '../dto';
import { Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { map, Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { OnTask } from '../tasks.decorators';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Source } from '../../sources/models';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { GrpcClientProvider } from '../../shared';

@Resolver(() => Task)
export class TasksResolver extends GrpcClientProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @Inject('webarchiver') client: ClientGrpc,
    private eventEmitter: EventEmitter2,
  ) {
    super(rootLogger, client);
  }

  @Query(() => Task, { name: 'task' })
  getTask(): Observable<Task> {
    return this.tasksService.getTask({ id: '' }, new Metadata());
  }

  @OnTask.Created()
  handleTaskCreatedEvent(task: Task) {
    this.tasksService.getTaskStream({ id: task.id }, new Metadata()).subscribe(
      (task) => {
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
            console.log('skip', task);
            this.eventEmitter.emit('task.skipped', task);
          }
        }
      },
      (err) => {
        console.log('err2', err);
      },
      () => {
        console.log('handleTaskCreatedEvent', 'complete');
      },
    );
  }

  @OnTask.Accepted()
  handleTaskAcceptedEvent(task: Task) {
    console.log('accepted', task);
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

  // @OnTask.Matched()
  // handleTaskMatchedEvent(task: Task) {}

  @Mutation(() => Task)
  createTask(@Args('input') { pageId }: CreateTaskDto): Observable<Task> {
    console.log('pageId', pageId);
    return this.tasksService.createTask({ pageId }, new Metadata()).pipe(
      map((task) => {
        this.eventEmitter.emit('task.created', task);
        return task;
      }),
    );
  }
}
