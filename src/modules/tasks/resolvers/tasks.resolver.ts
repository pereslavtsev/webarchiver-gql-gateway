import { Args, Resolver, Mutation, Query, Subscription } from '@nestjs/graphql';
import { Task } from '../models';
import { CreateTaskDto } from '../dto';
import { Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { map, Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { GrpcClientProvider, UseGqlSerializer } from '../../shared';
import { plainToClass } from 'class-transformer';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { InjectPubSub } from '../../pubsub';

@Resolver(() => Task)
export class TasksResolver extends GrpcClientProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @Inject('webarchiver') client: ClientGrpc,
    @InjectPubSub() private pubsub: RedisPubSub,
    private eventEmitter: EventEmitter2,
  ) {
    super(rootLogger, client);
  }

  @UseGqlSerializer()
  @Query(() => Task, { name: 'task' })
  getTask(): Observable<Task> {
    return this.tasksService.getTask({ id: '' }, new Metadata());
  }

  @Subscription(() => Task, {
    name: 'taskUpdated',
    resolve: (payload) => {
      return plainToClass(Task, payload.taskUpdated, { groups: ['pubsub'] });
    },
  })
  updateTaskHandler() {
    return this.pubsub.asyncIterator('taskUpdated');
  }

  @UseGqlSerializer()
  @Mutation(() => Task)
  createTask(@Args('input') { pageId }: CreateTaskDto): Observable<Task> {
    return this.tasksService.createTask({ pageId }, new Metadata()).pipe(
      map((task) => {
        this.eventEmitter.emit('task.created', task);
        return plainToClass(Task, task);
      }),
    );
  }
}
