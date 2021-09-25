import { ModuleMetadata } from '@nestjs/common';

export interface CdxClientModuleOptions {
  url?: string;
}

export interface CdxClientModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useFactory?: (
    ...args: any[]
  ) => Promise<CdxClientModuleOptions> | CdxClientModuleOptions;
  inject?: any[];
}
