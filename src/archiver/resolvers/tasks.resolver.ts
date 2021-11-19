import {
  Args,
  ArgsType,
  ID,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { Task } from '../models/task.model';
import { TasksService } from '../services/tasks.service';
import { PubSub } from 'graphql-subscriptions';
import { OnEvent } from '@nestjs/event-emitter';
import { PaginatedTask } from '../models/paginated-task';
import { PaginationArgs } from '../../shared/dto/pagination.args';
import { CreateTaskInput } from '../dto/create-task.input';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export const pubSub = new PubSub();

@Resolver(() => Task)
export class TasksResolver {
  constructor(
    private tasksService: TasksService,
    @InjectQueue('pages') private pagesQueue: Queue,
  ) {}

  @Mutation(() => Task)
  async createTask(@Args('input') { pageId }: CreateTaskInput) {
    const task = new Task();
    task.pageId = pageId;
    return this.tasksService.create(task);
  }

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
  async handleTaskCreatedEvent(event: Task) {
    await pubSub.publish('taskAdded', { taskAdded: event });
  }

  @OnEvent('task.updated')
  async handleTaskUpdatedEvent(event: Task) {
    const task = await this.tasksService.findById(event.id);
    console.log('task', task);
    await pubSub.publish('taskUpdated', { taskUpdated: task });
  }
}
