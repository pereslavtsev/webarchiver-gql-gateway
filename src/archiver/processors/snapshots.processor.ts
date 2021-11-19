import { OnQueueActive, Processor, Process, OnQueueError } from '@nestjs/bull';
import { Job } from 'bull';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { Source } from '../models/source.model';
import { Snapshot } from '../../snapshots/models/snapshot.model';
import { SnapshotsService } from '../../snapshots/snapshots.service';
import { SourcesService } from '../services/sources.service';
import { SourceStatus } from '../enums/source-status.enum';

@Processor('snapshots')
export class SnapshotsProcessor {
  protected readonly logger: Bunyan;

  constructor(
    @RootLogger() rootLogger: Bunyan,
    private snapshotsService: SnapshotsService,
    private sourcesService: SourcesService,
  ) {
    this.logger = rootLogger.child({ processor: 'snapshots' });
  }

  @Process()
  async findSnapshots(job: Job<Source>) {
    const jobLogger = this.logger.child({ reqId: job.id });
    jobLogger.debug('fetching snapshots for url:', job.data.url);
    const allSnapshots: Snapshot[] = [];
    try {
      for await (const snapshots of this.snapshotsService.fetchGen({
        url: job.data.url,
        filter: {
          statusCode: 200,
        },
      })) {
        allSnapshots.push(...snapshots);
      }
      jobLogger.debug(
        `totally ${allSnapshots.length} snapshots was found for url: ${job.data.url}`,
      );
      jobLogger.debug('find nearest snapshot');

      if (!allSnapshots.length) {
        //await job.takeLock();
        jobLogger.debug(`no snapshots for url was found, job has been locked`);
        await this.sourcesService.update(job.data.id, {
          status: SourceStatus.FAILED,
        });
        return;
      }
      const [nearestSnapshot] = allSnapshots
        .slice()
        .sort(
          (a, b) =>
            Math.abs(
              a.capturedAt.valueOf() - new Date(job.data.addedAt).valueOf(),
            ) -
            Math.abs(
              b.capturedAt.valueOf() - new Date(job.data.addedAt).valueOf(),
            ),
        );
      const archiveUrl = this.snapshotsService.buildUrl(nearestSnapshot);
      await this.sourcesService.update(job.data.id, {
        archiveUrl,
        archiveDate: nearestSnapshot.capturedAt,
        status: SourceStatus.ARCHIVED,
      });
    } catch (error) {
      this.logger.error(error);
      await this.sourcesService.update(job.data.id, {
        status: SourceStatus.FAILED,
      });
    }
  }

  @OnQueueError()
  error(error: Error) {
    this.logger.error(error);
  }
}
