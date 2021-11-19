import { Module } from '@nestjs/common';
import { TasksResolver } from './tasks.resolver';

@Module({
  providers: [TasksResolver],
})
export class TasksModule {}
