import { Module } from '@nestjs/common';
import { WebArchiveService } from './service/web-archive.service';
import { TasksService } from './service/tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './models/task.model';
import { Source } from './models/source.model';
import { InjectBot } from '../mwn/mwn.decorator';
import { mwn } from 'mwn';
import { SourcesService } from './service/sources.service';
import { QueryFailedError } from 'typeorm';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Source]),
    HttpModule.register({
      baseURL: 'https://web.archive.org/cdx/search/cdx',
      timeout: 10 * 1000,
      maxRedirects: 5,
    }),
  ],
  providers: [WebArchiveService, TasksService, SourcesService],
  exports: [WebArchiveService, TasksService, SourcesService],
})
export class WebArchiveModule {
  constructor(
    @InjectBot() private readonly bot: mwn,
    private readonly tasksService: TasksService,
    private readonly webArchiveService: WebArchiveService,
  ) {}

  async onModuleInit() {
    for await (const snapshots of this.webArchiveService.fetchCapturesGen({
      url: 'https://www.bbc.co.uk/russian/radio/radio_vecher/2010/04/100401_vecher_afghanistan_drugs.shtml',
    })) {
      console.log('snapshots', snapshots);
    }

    // await this.bot.login();
    // for await (const json of this.bot.continuedQueryGen({
    //   action: 'query',
    //   titles: 'Шаблон:Талибан',
    //   generator: 'transcludedin',
    //   gtilimit: 'max',
    //   gtinamespace: 0,
    //   prop: 'revisions',
    //   rvslots: 'main',
    //   rvprop: ['ids', 'content'],
    // })) {
    //   for (const page of json.query.pages) {
    //     const [
    //       {
    //         slots: {
    //           main: { content },
    //         },
    //       },
    //     ] = page.revisions;
    //     const wkt = new this.bot.wikitext(content);
    //     const templates = wkt.parseTemplates({
    //       namePredicate: (name) => name.toLowerCase() === 'cite web',
    //       templatePredicate: (name) => !name.getParam('archiveurl'),
    //     });
    //     const urls = templates.map((tpl) => tpl.getParam('url').value);
    //     try {
    //       const task = await this.tasksService.create(page.pageid, urls);
    //       console.log('task', task);
    //     } catch (error) {
    //       if (error instanceof QueryFailedError) {
    //         if (Number(error.driverError.code) === 23505) {
    //           console.log('task already exists');
    //         } else {
    //           console.log('error', error);
    //           throw error;
    //         }
    //       }
    //     }
    //   }
    // }
  }
}
