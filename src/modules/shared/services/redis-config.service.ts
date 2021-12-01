import { Injectable } from '@nestjs/common';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import {
  RedisModuleOptions,
  RedisModuleOptionsFactory,
} from '@nestjs-modules/ioredis';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfigService
  extends LoggableProvider
  implements RedisModuleOptionsFactory
{
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private configService: ConfigService,
  ) {
    super(rootLogger);
  }

  createRedisModuleOptions(): RedisModuleOptions {
    const url = this.configService.get('REDIS_URL');
    return {
      config: {
        url,
      },
    };
  }
}
