import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Injectable } from '@nestjs/common';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { PubSubModuleOptions, PubSubModuleOptionsFactory } from '../../pubsub';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';

@Injectable()
export class PubSubConfigService
  extends LoggableProvider
  implements PubSubModuleOptionsFactory
{
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super(rootLogger);
  }

  createPubSubModuleOptions(): PubSubModuleOptions {
    return {
      publisher: this.redis,
      subscriber: this.redis.duplicate(),
    };
  }
}
