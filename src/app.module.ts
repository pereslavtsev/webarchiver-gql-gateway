import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { SharedModule } from './shared/shared.module';
import { SourcesModule } from './sources/sources.module';

@Module({
  imports: [TasksModule, SharedModule, SourcesModule],
})
export class AppModule {}
