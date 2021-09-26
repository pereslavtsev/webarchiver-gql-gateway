import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import { InjectBot } from 'nest-mwn';
import { ApiParams, ApiRevision, mwn } from 'mwn';
import { Job } from 'bull';
import colorizeJson from 'json-colorizer';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { SourcesService } from '../services/sources.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Task } from '../models/task.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskStatus } from '../enums/task-status.enum';

@Processor('pages')
export class PagesProcessor {
  protected readonly logger: Bunyan;

  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectBot() private readonly bot: mwn,
    private sourcesService: SourcesService,
    private eventEmitter: EventEmitter2,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {
    this.logger = rootLogger.child({ component: this.constructor.name });
  }

  @Process()
  async handleProcess(job: Job<Task>) {
    try {
      const task = job.data;
      const { query } = await this.bot.query({
        action: 'query',
        pageids: [task.pageId],
        prop: 'revisions',
        rvslots: 'main',
        rvprop: ['ids', 'content'],
      });
      const [page] = query.pages;
      const [latestRevision]: ApiRevision[] = page.revisions;
      const sources = this.sourcesService.extractUnarchived(latestRevision);
      this.logger.info(
        `${sources.length} unarchived sources from page "${page.title}" was found`,
      );
      if (sources.length) {
        this.logger.info(
          'unarchived urls:',
          colorizeJson(JSON.stringify(sources.map((source) => source.url))),
        );
        task.revisionId = latestRevision.revid;
        task.pageTitle = page.title;
        task.sources = sources;
        this.eventEmitter.emit('task.processed', task);
      }
      //   const json = await this.bot.query(job.data);
      //   this.logger.info(
      //     'received pages:',
      //     colorizeJson(json.query.pages.map((p) => p.title)),
      //   );
      //   for (const page of json.query.pages) {
      //     const [latestRevision] = page.revisions;
      //     const sources = this.sourcesService.extractUnarchived(latestRevision);
      //     this.logger.info(
      //       `${sources.length} unarchived sources from page "${page.title}" was found`,
      //     );
      //     if (sources.length) {
      //       this.logger.info(
      //         'unarchived urls:',
      //         colorizeJson(JSON.stringify(sources.map((source) => source.url))),
      //       );
      //       const task = new Task();
      //       task.pageId = page.pageid;
      //       task.pageTitle = page.title;
      //       task.revisionId = latestRevision.revid;
      //       task.sources = sources;
      //       this.eventEmitter.emit('task.received', task);
      //     }
      //   }
      //   if (json.continue) {
      //     await job.queue.add('', {
      //       ...job.data,
      //       ...json.continue,
      //     });
      //   }
    } catch (e) {
      console.log('errir', e);
    }
  }

  @OnQueueActive()
  async handleQueueActive(job: Job<ApiParams>) {
    const task = job.data;
    await this.tasksRepository.save({ ...task, status: TaskStatus.ACTIVE });
  }
}
