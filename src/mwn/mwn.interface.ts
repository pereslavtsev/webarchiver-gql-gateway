import { MwnOptions } from 'mwn';
import { Type, ModuleMetadata } from '@nestjs/common';

export type MwnModuleOptions = MwnOptions;

export type MwnModuleAsyncOptions = {
  useClass?: Type<MwnModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<MwnModuleOptions> | MwnModuleOptions;
  inject?: any[];
  useExisting?: Type<MwnModuleOptionsFactory>;
} & Pick<ModuleMetadata, 'imports'>;

export interface MwnModuleOptionsFactory {
  createMwnModuleOptions(): Promise<MwnModuleOptions> | MwnModuleOptions;
}
