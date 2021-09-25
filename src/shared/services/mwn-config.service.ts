import { Inject, Injectable } from '@nestjs/common';
import { MwnModuleOptions, MwnModuleOptionsFactory } from 'nest-mwn';
import mwnConfig from '../config/mwn.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class MwnConfigService implements MwnModuleOptionsFactory {
  constructor(
    @Inject(mwnConfig.KEY)
    private config: ConfigType<typeof mwnConfig>,
  ) {}

  createMwnModuleOptions(): MwnModuleOptions {
    return {
      apiUrl: 'https://ru.wikipedia.org/w/api.php',
      username: this.config.username,
      password: this.config.password,
    };
  }
}
