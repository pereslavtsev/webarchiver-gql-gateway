import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { mwn } from 'mwn';
import { InjectBot } from './mwn/mwn.decorator';
import { SharedModule } from './shared/shared.module';
import { WebArchiveModule } from './web-archive/web-archive.module';

@Module({
  imports: [SharedModule, WebArchiveModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectBot() private readonly bot: mwn) {}

  async onModuleInit() {
    // await this.bot.login();
    // const xxx = await this.bot.query({
    //   action: 'query',
    //   titles: 'Шаблон:Талибан',
    //   generator: 'transcludedin',
    //   gtilimit: 'max',
    //   gtinamespace: 0,
    //   prop: 'revisions',
    //   rvslots: 'main',
    //   rvprop: ['ids', 'content'],
    // });
    // console.log('xxx', xxx.query.pages[0]);
    // console.log('xxx', xxx.query.pages[0].revisions[0]);
    // const value = xxx.query.pages[0].revisions[0].content;
    // const wkt = new this.bot.wikitext(value);
    // const sss = wkt.parseTemplates({
    //   namePredicate: (name) => name.toLowerCase() === 'cite web',
    //   templatePredicate: (name) => !name.getParam('archiveurl'),
    // });
    // console.log(
    //   'xxx',
    //   sss.map((value1) => value1.parameters),
    // );

  }
}
