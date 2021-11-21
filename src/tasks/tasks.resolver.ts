import { Args, Resolver, Mutation, Query } from '@nestjs/graphql';
import { Task } from './models/task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, map, Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { core } from '@webarchiver/protoc';
import { OnTask } from './tasks.decorators';
import { EventEmitter2 } from '@nestjs/event-emitter';

const { TASKS_SERVICE_NAME, SOURCES_SERVICE_NAME } = core.v1;

@Resolver(() => Task)
export class TasksResolver implements OnModuleInit {
  private tasksService: core.v1.TasksServiceClient;
  private sourcesService: core.v1.SourcesServiceClient;

  constructor(
    @Inject('CORE_PACKAGE') private client: ClientGrpc,
    private eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.tasksService =
      this.client.getService<core.v1.TasksServiceClient>(TASKS_SERVICE_NAME);
    this.sourcesService =
      this.client.getService<core.v1.SourcesServiceClient>(
        SOURCES_SERVICE_NAME,
      );
  }

  @Query(() => Task)
  getTasks() {
    return this.tasksService.getTask({ id: '' }, new Metadata());
  }

  @OnTask.Created()
  handleTaskCreatedEvent(task: core.v1.Task) {
    this.tasksService.getTaskStream({ id: task.id }, new Metadata()).subscribe(
      (task) => {
        const { status } = task;
        switch (status) {
          case core.v1.Task_Status.MATCHED: {
            this.eventEmitter.emit('task.matched', task);
            break;
          }
          case core.v1.Task_Status.ACCEPTED: {
            this.eventEmitter.emit('task.accepted', task);
          }
        }
      },
      (err) => {
        console.log('err2', err);
      },
    );
  }

  @OnTask.Accepted()
  handleTaskAcceptedEvent(task: core.v1.Task) {
    console.log('accepted', task);
    this.sourcesService
      .getSourcesStream({ taskId: task.id }, new Metadata())
      .subscribe((source) => {
        const { status } = source;
        switch (status) {
          case core.v1.Source_Status.PENDING: {
            this.eventEmitter.emit('source.received', source);
            break;
          }
          case core.v1.Source_Status.MATCHED: {
            this.eventEmitter.emit('source.matched', source);
            break;
          }
        }
      });
  }

  @OnTask.Matched()
  handleTaskMatchedEvent(task: core.v1.Task) {}

  @Mutation(() => Task)
  createTask(@Args('input') { pageId }: CreateTaskDto) {
    console.log('pageId', pageId);
    return this.tasksService.createTask({ pageId }, new Metadata()).pipe(
      map((task) => {
        this.eventEmitter.emit('task.created', task);
        return task;
      }),
    );
  }
}
