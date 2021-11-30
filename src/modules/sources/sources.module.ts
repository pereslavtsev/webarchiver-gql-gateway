import { Module } from '@nestjs/common';
import { SourceListener } from './source.listener';

@Module({
  providers: [SourceListener],
})
export class SourcesModule {}
