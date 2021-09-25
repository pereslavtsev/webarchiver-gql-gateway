import { Query, Resolver } from '@nestjs/graphql';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Resolver()
export class CrawlerResolver {
  constructor(@InjectQueue('pages') private pagesQueue: Queue) {}

  @Query(() => Boolean)
  async start() {
    await this.pagesQueue.resume();
    return true;
  }

  @Query(() => Boolean)
  async pause() {
    await this.pagesQueue.pause();
    return true;
  }
}
