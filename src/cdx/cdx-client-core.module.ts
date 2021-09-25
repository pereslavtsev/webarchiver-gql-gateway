import { DynamicModule, Global, Module } from '@nestjs/common';
import {
  CdxClientModuleAsyncOptions,
  CdxClientModuleOptions,
} from './cdx-client.interface';
import { CDX_CLIENT_MODULE_OPTIONS } from './cdx-client.constant';
import { CdxConfigService, CdxService } from './services';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({})
export class CdxClientCoreModule {
  static forRoot(options?: CdxClientModuleOptions): DynamicModule {
    const cdxClientModuleOptions = {
      provide: CDX_CLIENT_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      imports: [
        HttpModule.registerAsync({
          useClass: CdxConfigService,
        }),
      ],
      module: CdxClientCoreModule,
      providers: [cdxClientModuleOptions, CdxService],
      exports: [CdxService],
    };
  }

  static forRootAsync(options: CdxClientModuleAsyncOptions): DynamicModule {
    const cdxClientModuleOptions = {
      provide: CDX_CLIENT_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      module: CdxClientCoreModule,
      imports: options.imports,
      providers: [cdxClientModuleOptions],
      exports: [],
    };
  }
}
