import { Type, ModuleMetadata } from '@nestjs/common';
import { PubSubRedisOptions } from 'graphql-redis-subscriptions/dist/redis-pubsub';

export type PubSubModuleOptions = PubSubRedisOptions;

export type PubSubModuleAsyncOptions = {
  useClass?: Type<PubSubModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<PubSubModuleOptions> | PubSubModuleOptions;
  inject?: any[];
  useExisting?: Type<PubSubModuleOptionsFactory>;
} & Pick<ModuleMetadata, 'imports'>;

export interface PubSubModuleOptionsFactory {
  createPubSubModuleOptions():
    | Promise<PubSubModuleOptions>
    | PubSubModuleOptions;
}
