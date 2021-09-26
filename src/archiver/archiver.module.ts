import { Module, OnModuleInit } from '@nestjs/common';
import { TasksResolver } from './resolvers/tasks.resolver';
import { TasksService } from './services/tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './models/task.model';
import { Source } from './models/source.model';
import { SourcesService } from './services/sources.service';
import { TaskSubscriber } from './subscribers/task.subscriber';
import { SourceSubscriber } from './subscribers/source.subscriber';
import { SourceListener } from './listeners/source.listener';
import { TaskListener } from './listeners/task.listener';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { Connection } from 'typeorm';
import {
  PagesProcessor,
  RevisionsProcessor,
  SnapshotsProcessor,
  WriterProcessor,
} from './processors';
import { CrawlerResolver } from './resolvers/crawler.resolver';
import { Queue } from 'bull';
import { SnapshotsModule } from '../snapshots/snapshots.module';
import { PagesResolver } from './resolvers/pages.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Source]),
    SnapshotsModule,
    BullModule.registerQueue(
      {
        name: 'pages',
      },
      {
        name: 'revisions',
      },
      {
        name: 'snapshots',
      },
      {
        name: 'writer',
      },
    ),
  ],
  providers: [
    // crawlers
    CrawlerResolver,
    PagesResolver,
    TasksResolver,

    // services
    TasksService,
    SourcesService,

    // DB subscribers
    TaskSubscriber,
    SourceSubscriber,

    // event listeners
    TaskListener,
    SourceListener,

    // processors
    PagesProcessor,
    RevisionsProcessor,
    SnapshotsProcessor,
    WriterProcessor,
  ],
})
export class ArchiverModule implements OnModuleInit {
  private readonly queues: Queue[];

  constructor(
    private connection: Connection,
    @InjectQueue('pages') private pagesQueue: Queue,
    @InjectQueue('revisions') private revisionsQueue: Queue,
    @InjectQueue('snapshots') private snapshotsQueue: Queue,
    @InjectQueue('writer') private writerQueue: Queue,
  ) {
    this.queues = [
      this.pagesQueue,
      this.revisionsQueue,
      this.snapshotsQueue,
      this.writerQueue,
    ];
  }

  async onModuleInit(): Promise<void> {
    for (const queue of this.queues) {
      await queue.empty();
      await queue.clean(0, 'completed');
      await queue.clean(0, 'active');
      await queue.clean(0, 'delayed');
      await queue.clean(0, 'failed');
    }
    await this.connection.getRepository(Task).delete({});
  }
}
