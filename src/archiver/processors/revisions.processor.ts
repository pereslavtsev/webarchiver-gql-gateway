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

@Processor('revisions')
export class RevisionsProcessor {
  protected readonly logger: Bunyan;

  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectBot() private readonly bot: mwn,
    @InjectQueue('snapshots') private snapshotsQueue: Queue,
    private tasksService: TasksService,
    private sourcesService: SourcesService,
  ) {
    this.logger = rootLogger.child({ component: this.constructor.name });
  }

  @Process()
  async detectTime(job: Job<Task>) {
    const { pageId, sources } = job.data;

    try {
      //console.log('detect', job.data);
      const dict = {};
      console.log('dict', dict);
      for (const source of sources) {
        dict[source.url] = null;
      }
      // console.log('dictdict', dict);
      let progress = 0;
      const task = await this.tasksService.findByPageId(pageId);
      console.log('task', task);

      for await (const json of this.bot.continuedQueryGen({
        action: 'query',
        pageids: pageId,
        // generator: 'revisions',
        // grvlimit: '10',
        rvdir: 'newer',
        // prop: 'extlinks',
        prop: 'revisions',
        rvslots: 'main',
        rvlimit: 'max',
        rvprop: ['ids', 'content', 'timestamp'],
      })) {
        const [{ revisions }] = json.query.pages;
        console.log(revisions[0].timestamp);

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
              const s = task.sources.find((s) => s.url === source.url);
              s.addedAt = new Date(timestamp);
              const sss = await this.sourcesService.update(s.id, {
                addedAt: timestamp,
              });
              console.log('sss', sss);
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
  completed(job: Job, result: any) {
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
