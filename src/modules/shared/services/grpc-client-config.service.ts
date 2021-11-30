import { Injectable } from '@nestjs/common';
import {
  ClientsModuleOptionsFactory,
  GrpcOptions,
  Transport,
} from '@nestjs/microservices';
import { resolve } from 'path';

@Injectable()
export class GrpcClientConfigService implements ClientsModuleOptionsFactory {
  createClientOptions(): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        url: '0.0.0.0:50051',
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
