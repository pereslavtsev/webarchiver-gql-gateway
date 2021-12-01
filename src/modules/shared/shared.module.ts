import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GqlConfigService, Logger, GrpcClientConfigService, RedisConfigService, PubSubConfigService } from './services';
import { GraphQLModule } from '@nestjs/graphql';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggingModule } from '@eropple/nestjs-bunyan';
import { ROOT_LOGGER } from './utils/logger.util';
import { ClientsModule } from '@nestjs/microservices';
import { RedisModule } from '@nestjs-modules/ioredis';
import { PubSubModule } from '../pubsub';

@Global()
@Module({
  imports: [
    LoggingModule.forRoot(ROOT_LOGGER, {}),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    ClientsModule.registerAsync([
      {
        name: 'webarchiver',
        useClass: GrpcClientConfigService,
      },
    ]),
    RedisModule.forRootAsync({
      useClass: RedisConfigService,
    }),
    PubSubModule.forRootAsync({
      useClass: PubSubConfigService,
    }),
    GraphQLModule.forRootAsync({
      useClass: GqlConfigService,
    }),
  ],
  providers: [Logger],
  exports: [Logger, ClientsModule, PubSubModule],
})
export class SharedModule {}
