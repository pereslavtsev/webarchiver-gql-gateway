import { Args, Resolver, Mutation, Query } from '@nestjs/graphql';
import { Task } from './models/task.model';
import { CreateTaskDto } from './dto/create-task.dto';

@Resolver(() => Task)
export class TasksResolver {
  @Query(() => Task)
  async getTasks() {
    return {}
  }

  @Mutation(() => Task)
  async createTask(@Args('input') { pageId }: CreateTaskDto) {
    console.log('pageId', pageId);
    return {}
  }
}
