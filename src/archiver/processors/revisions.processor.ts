import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { InjectBot } from 'nest-mwn';
import { mwn } from 'mwn';
import {
  Process,
  Processor,
  OnQueueProgress,
  OnQueueCompleted,
  InjectQueue,
} from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { TasksService } from '../services/tasks.service';
import { SourcesService } from '../services/sources.service';
import { Task } from '../models/task.model';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Processor('revisions')
export class RevisionsProcessor {
  protected readonly logger: Bunyan;

  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectBot() private readonly bot: mwn,
    @InjectQueue('snapshots') private snapshotsQueue: Queue,
    private tasksService: TasksService,
    private sourcesService: SourcesService,
    private eventEmitter: EventEmitter2,
  ) {
    this.logger = rootLogger.child({ component: this.constructor.name });
  }

  @OnEvent('source.revisionMatched')
  async handleRevisionMatched(event: { sourceId: string; timestamp: string }) {
    const sss = await this.sourcesService.update(event.sourceId, {
      addedAt: event.timestamp,
    });
    await this.snapshotsQueue.add(sss);
  }

  @Process()
  async detectTime(job: Job<Task>) {
    const { pageId, sources } = job.data;

    try {
      const dict = {};
      for (const source of sources) {
        dict[source.url] = null;
      }
      let progress = 0;
      for await (const { query } of this.bot.continuedQueryGen({
        action: 'query',
        pageids: pageId,
        rvdir: 'newer',
        prop: 'revisions',
        rvslots: 'main',
        rvlimit: 'max',
        rvprop: ['ids', 'content', 'timestamp'],
      })) {
        const [{ revisions }] = query.pages;

        for (const revision of revisions) {
          const {
            slots: {
              main: { content, texthidden },
            },
            timestamp,
          } = revision;
          if (texthidden) {
            continue;
          }

          for (const source of sources) {
            if (content.includes(source.url) && !dict[source.url]) {
              dict[source.url] = timestamp;
              const s = sources.find((s) => s.url === source.url);
              s.addedAt = new Date(timestamp);
              const sss = await this.sourcesService.update(s.id, {
                addedAt: timestamp,
              });
              await this.snapshotsQueue.add(sss);
            }

            if (Object.values(dict).every((timestamp) => !!timestamp)) {
              //await job.finished();
              await job.progress(100);
              return;
            }
          }

          progress = +(
            (Object.values(dict).filter((x) => x).length / sources.length) *
            100
          ).toFixed(2);
        }
        if (progress !== job.progress()) {
          await job.progress(progress);
        }
      }
    } catch (e) {
      console.log('error', e);
    }
  }

  @OnQueueCompleted()
  completed(job: Job) {
    const jobLogger = this.logger.child({ reqId: job.id });
    //jobLogger.debug({ job, result });
    jobLogger.info(
      'All sources timestamps has been detected, breaking the fetching...',
    );
  }

  @OnQueueProgress()
  progress(job: Job, progress: number) {
    const jobLogger = this.logger.child({ reqId: job.id });
    jobLogger.debug(`Job ${job.id} progress was updated to ${progress}%`);
  }
}
