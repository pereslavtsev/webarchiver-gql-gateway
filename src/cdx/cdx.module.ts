import { DynamicModule, Inject, Module, OnModuleInit } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { CdxConfigService, CdxService } from './services';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import short from 'short-uuid';
import { convertCdxJsonToPlainObject, transformFilterParams } from './cdx.util';
import { stringify } from 'querystring';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import cdxConfig from './cdx.config';
import { ConfigType } from '@nestjs/config';
import { CdxClientModuleAsyncOptions, CdxClientModuleOptions } from './cdx-client.interface';
import { CdxClientCoreModule } from './cdx-client-core.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      useClass: CdxConfigService,
    }),
  ],
  providers: [CdxService],
  exports: [CdxService],
})
export class CdxModule implements OnModuleInit {
  protected readonly logger: Bunyan;

  constructor(
    @RootLogger() rootLogger: Bunyan,
    private httpService: HttpService,
    private cdxService: CdxService,
    @Inject(cdxConfig.KEY)
    private config: ConfigType<typeof cdxConfig>,
  ) {
    this.logger = rootLogger.child({ component: this.constructor.name });
    this.httpService.axiosRef.interceptors.request.use(
      this.onRequest.bind(this),
    );
    this.httpService.axiosRef.interceptors.response.use(
      this.onResponse.bind(this),
      this.onRejected.bind(this),
    );
  }

  static forRoot(options?: CdxClientModuleOptions): DynamicModule {
    return {
      module: CdxModule,
      imports: [CdxClientCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: CdxClientModuleAsyncOptions): DynamicModule {
    return {
      module: CdxModule,
      imports: [CdxClientCoreModule.forRootAsync(options)],
    };
  }

  async onModuleInit(): Promise<void> {
    // try {
    //   this.logger.debug('Test connection to CDX API server ...');
    //   await this.cdxService.query({
    //     url: 'archive.org',
    //     limit: 3,
    //   });
    // } catch (error) {
    //   this.logger.warn(error, 'CDX API server returns error');
    //   this.logger.warn(
    //     `It seems CDX API server is temporary unavailable now, it's a NOT serious error`,
    //   );
    // }
  }

  protected onRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    const reqId = short.generate();
    config.params.reqId = reqId;
    const reqLogger = this.logger.child({ reqId });
    if (config.params.filter) {
      config.params.filter = transformFilterParams(config.params.filter);
    }
    const requestUrl = `${config.baseURL}?${stringify(config.params)}`;
    // reqLogger.debug('req url', requestUrl);
    // reqLogger.debug(config, 'req config');
    return config;
  }

  protected onResponse(response: AxiosResponse): AxiosResponse {
    const reqId = response.config.params.reqId;
    delete response.config.params.reqId;
    const resLogger = this.logger.child({ reqId });
    //resLogger.info(`api response (unparsed)`, colorize(response.data));
    response.data = convertCdxJsonToPlainObject(response.data);
    //resLogger.debug(response.data, 'api response');
    return response;
  }

  protected onRejected(error: Error): void {
    this.logger.error(error, 'CDX request was failed with error');
    throw error;
  }
}
