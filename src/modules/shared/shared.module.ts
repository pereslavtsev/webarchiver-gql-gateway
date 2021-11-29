import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GqlConfigService } from './services';
import { GraphQLModule } from '@nestjs/graphql';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggingModule } from '@eropple/nestjs-bunyan';
import { ROOT_LOGGER } from './utils/logger.util';
import { Logger } from './services/logger.service';
import { ClientsModule } from '@nestjs/microservices';
import { GrpcClientConfigService } from './services';

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
    GraphQLModule.forRootAsync({
      useClass: GqlConfigService,
    }),
  ],
  providers: [Logger],
  exports: [Logger, ClientsModule],
})
export class SharedModule {}
