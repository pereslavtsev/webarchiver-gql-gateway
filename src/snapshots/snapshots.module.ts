import { Module } from '@nestjs/common';
import { CdxModule } from '../cdx';
import { SnapshotsService } from './snapshots.service';

@Module({
  imports: [CdxModule.forRoot()],
  providers: [SnapshotsService],
  exports: [CdxModule, SnapshotsService],
})
export class SnapshotsModule {}
