import { Module } from '@nestjs/common';
import { WatchersResolver } from './resolvers/watchers.resolver';

@Module({
  providers: [WatchersResolver],
})
export class WatchersModule {}
