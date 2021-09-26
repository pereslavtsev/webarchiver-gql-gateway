import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { ArchiverModule } from './archiver/archiver.module';

@Module({
  imports: [SharedModule, ArchiverModule],
})
export class AppModule {}
