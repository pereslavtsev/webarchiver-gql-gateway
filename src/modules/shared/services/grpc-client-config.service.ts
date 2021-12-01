import { Injectable } from '@nestjs/common';
import {
  ClientsModuleOptionsFactory,
  GrpcOptions,
  Transport,
} from '@nestjs/microservices';
import { resolve } from 'path';
import { ConfigService } from '@nestjs/config';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@Injectable()
export class GrpcClientConfigService
  extends LoggableProvider
  implements ClientsModuleOptionsFactory
{
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private configService: ConfigService,
  ) {
    super(rootLogger);
  }

  createClientOptions(): GrpcOptions {
    const url = this.configService.get('GRPC_URL');
    return {
      transport: Transport.GRPC,
      options: {
        url,
        package: 'pereslavtsev.webarchiver.v1',
        protoPath: resolve(
          'node_modules',
          '@pereslavtsev/webarchiver-protoc',
          'dist',
          'proto',
          `webarchiver.proto`,
        ),
      },
    };
  }
}
