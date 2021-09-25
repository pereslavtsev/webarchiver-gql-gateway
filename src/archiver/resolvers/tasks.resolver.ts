import { Args, ID, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Task } from '../models/task.model';
import { TasksService } from '../services/tasks.service';
import { PubSub } from 'graphql-subscriptions';
import { OnEvent } from '@nestjs/event-emitter';
import { PaginatedTask } from '../models/paginated-task';
import { PaginationArgs } from '../../shared/dto/pagination.args';

export const pubSub = new PubSub();

@Resolver(() => Task)
export class TasksResolver {
  constructor(private tasksService: TasksService) {}

  @Query(() => Task, { name: 'task' })
  getTask(@Args('id', { type: () => ID }) id: Task['id']) {
    return this.tasksService.findById(id);
  }

  @Query(() => PaginatedTask, { name: 'tasks' })
  getTasks(@Args() pagination: PaginationArgs) {
    return this.tasksService.findPaginated(pagination);
  }

  @Subscription(() => Task, { name: 'taskAdded' })
  addTaskHandler() {
    return pubSub.asyncIterator('taskAdded');
  }

  @Subscription(() => Task, { name: 'taskUpdated' })
  updateTaskHandler() {
    return pubSub.asyncIterator('taskUpdated');
  }

  @OnEvent('task.added')
  async handleOrderCreatedEvent(event: Task) {
    await pubSub.publish('taskAdded', { taskAdded: event });
  }
}
