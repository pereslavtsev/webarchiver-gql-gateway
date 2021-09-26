import { Inject, Injectable } from '@nestjs/common';
import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import { stringify } from 'querystring';
import cdxConfig from '../cdx.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class CdxConfigService implements HttpModuleOptionsFactory {
  constructor(
    @Inject(cdxConfig.KEY)
    private config: ConfigType<typeof cdxConfig>,
  ) {}

  createHttpOptions(): HttpModuleOptions {
    return {
      baseURL: this.config.url,
      timeout: 10 * 1000,
      maxRedirects: 5,
      paramsSerializer(p) {
        return stringify(p);
      },
    };
  }
}
