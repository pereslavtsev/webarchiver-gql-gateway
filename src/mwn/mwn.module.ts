import { DynamicModule, Module, Provider } from '@nestjs/common';
import { mwn } from 'mwn';
import { MwnModuleOptions } from './mwn.interface';
import { MwnConstants } from './mwn.constants';

@Module({})
export class MwnModule {
  public static forRoot(options: MwnModuleOptions): DynamicModule {
    const providers = this.createProviders(options);

    return {
      module: MwnModule,
      providers: providers,
      exports: providers,
    };
  }

  private static createProviders(options: MwnModuleOptions): Provider[] {
    return [
      {
        provide: MwnConstants.MWN_OPTIONS,
        useValue: options,
      },
      {
        provide: MwnConstants.MWN_INSTANCE,
        useFactory: () => new mwn(options),
      },
    ];
  }
}
