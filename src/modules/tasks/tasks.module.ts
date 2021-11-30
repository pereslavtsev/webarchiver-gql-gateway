import { Module } from '@nestjs/common';
import { TasksResolver } from './resolvers';

@Module({
  providers: [TasksResolver],
})
export class TasksModule {}
