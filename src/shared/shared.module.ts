import { Global, Module, OnModuleInit } from '@nestjs/common';
import { InjectBot, MwnModule } from 'nest-mwn';
import { ConfigModule } from '@nestjs/config';
import { GqlConfigService } from './services';
import { GraphQLModule } from '@nestjs/graphql';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggingModule } from '@eropple/nestjs-bunyan';
import { ROOT_LOGGER } from './utils/logger.util';
import { Logger } from './services/logger.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

const { TASKS_SERVICE_NAME, WEBARCHIVER_CORE_V1_PACKAGE_NAME } = core.v1;

@Global()
@Module({
  imports: [
    LoggingModule.forRoot(ROOT_LOGGER, {}),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    ClientsModule.register([
      {
        name: 'CORE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          url: '0.0.0.0:50051',
          package: WEBARCHIVER_CORE_V1_PACKAGE_NAME,
          protoPath: core.getProtoPath(),
        },
      },
    ]),
    GraphQLModule.forRootAsync({
      useClass: GqlConfigService,
    }),
  ],
  providers: [Logger],
  exports: [Logger],
})
export class SharedModule {}
