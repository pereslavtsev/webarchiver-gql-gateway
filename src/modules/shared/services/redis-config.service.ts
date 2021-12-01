import { Injectable } from '@nestjs/common';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import {
  RedisModuleOptions,
  RedisModuleOptionsFactory,
} from '@nestjs-modules/ioredis';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@Injectable()
export class RedisConfigService
  extends LoggableProvider
  implements RedisModuleOptionsFactory
{
  constructor(@RootLogger() rootLogger: Bunyan) {
    super(rootLogger);
  }

  createRedisModuleOptions(): RedisModuleOptions {
    return {
      config: {
        url: 'redis://localhost:6379',
      },
    };
  }
}
