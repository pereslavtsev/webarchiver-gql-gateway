import { Module } from '@nestjs/common';
import { TasksModule } from './tasks';
import { SharedModule } from './shared';
import { SourcesModule } from './sources';
import { WatchersModule } from './watchers';

@Module({
  imports: [TasksModule, SharedModule, SourcesModule, WatchersModule],
})
export class AppModule {}
