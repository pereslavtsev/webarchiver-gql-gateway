import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GqlConfigService } from './services';
import { GraphQLModule } from '@nestjs/graphql';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggingModule } from '@eropple/nestjs-bunyan';
import { ROOT_LOGGER } from './utils/logger.util';
import { Logger } from './services/logger.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { core, archiver } from '@webarchiver/protoc';

const { ARCHIVER_SERVICE_NAME, WEBARCHIVER_ARCHIVER_V1_PACKAGE_NAME } =
  archiver.v1;
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
      {
        name: 'ARCHIVER_PACKAGE',
        transport: Transport.GRPC,
        options: {
          url: '0.0.0.0:50052',
          package: WEBARCHIVER_ARCHIVER_V1_PACKAGE_NAME,
          protoPath: archiver.getProtoPath(),
        },
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
