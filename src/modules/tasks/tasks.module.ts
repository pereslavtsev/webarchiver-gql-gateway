import { Module } from '@nestjs/common';
import { TasksResolver } from './resolvers';
import { TaskListener } from './listeners';

@Module({
  providers: [TaskListener, TasksResolver],
})
export class TasksModule {}
