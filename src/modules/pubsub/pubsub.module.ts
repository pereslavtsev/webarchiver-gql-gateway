import { ClassProvider, DynamicModule, Module, Provider } from '@nestjs/common';
import { PUBSUB, PUBSUB_OPTIONS } from './pubsub.constants';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import {
  PubSubModuleAsyncOptions,
  PubSubModuleOptions,
  PubSubModuleOptionsFactory,
} from './pubsub.interface';

@Module({})
export class PubSubModule {
  public static forRoot(options: PubSubModuleOptions): DynamicModule {
    const providers = this.createProviders(options);

    return {
      module: PubSubModule,
      providers: providers,
      exports: providers,
    };
  }

  private static createProviders(options: PubSubModuleOptions): Provider[] {
    return [
      {
        provide: PUBSUB_OPTIONS,
        useValue: options,
      },
      {
        provide: PUBSUB,
        useFactory: () => new RedisPubSub(options),
      },
    ];
  }

  static forRootAsync(options: PubSubModuleAsyncOptions): DynamicModule {
    const mwnProvider: Provider = {
      inject: [PUBSUB_OPTIONS],
      provide: PUBSUB,
      useFactory: (options: PubSubModuleOptions) => new RedisPubSub(options),
    };

    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: PubSubModule,
      imports: [...(options.imports || [])],
      providers: [mwnProvider, ...asyncProviders],
      exports: [mwnProvider],
    };
  }

  private static createAsyncProviders(
    options: PubSubModuleAsyncOptions,
  ): Provider[] {
    if (options.useFactory || options.useExisting) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
        inject: [options.inject || []],
      } as ClassProvider,
    ];
  }

  private static createAsyncOptionsProvider(
    options: PubSubModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: PUBSUB_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: PUBSUB_OPTIONS,
      useFactory: async (
        optionsFactory: PubSubModuleOptionsFactory,
      ): Promise<PubSubModuleOptions> =>
        optionsFactory.createPubSubModuleOptions(),
      inject: options.useClass ? [options.useClass] : [],
    };
  }
}
