import { Process, Processor } from '@nestjs/bull';
import { InjectBot } from 'nest-mwn';
import { ApiRevision, mwn } from 'mwn';
import { Job } from 'bull';
import { Task } from '../models/task.model';
import { DateTime } from 'luxon';

@Processor('writer')
export class WriterProcessor {
  constructor(@InjectBot() private readonly bot: mwn) {}

  @Process()
  async handleProcess(job: Job<Task>) {
    try {
      const task = job.data;
      const { query } = await this.bot.query({
        action: 'query',
        pageids: [job.data.pageId],
        prop: 'revisions',
        rvslots: 'main',
        rvprop: ['ids', 'content'],
      });
      const [page] = query.pages;
      const [
        {
          revid,
          slots: {
            main: { content },
          },
        },
      ]: ApiRevision[] = page.revisions;

      if (task.revisionId !== revid) {
        // TODO: handle
      }

      const wkt = new this.bot.wikitext(content);
      const templates = wkt.parseTemplates({
        namePredicate: (name) => name.toLowerCase() === 'cite web',
        templatePredicate: (template) =>
          task.sources
            .map((source) => source.url)
            .includes(template.getParam('url').value),
      });
      let currentContent = wkt.getText();
      for (const template of templates) {
        const oldWikitext = template.wikitext.slice();
        const url = template.getParam('url').value;
        const source = task.sources.find((source) => source.url === url);
        const archiveDate = DateTime.fromISO(
          source.addedAt as unknown as string,
        ).toISODate();
        template.wikitext = template.wikitext.replace(
          /}}/,
          `|archive-url=${source.archiveUrl}|archive-date=${archiveDate}}`,
        );
        currentContent = currentContent.replace(oldWikitext, template.wikitext);
      }
      console.log('currentContent', currentContent);
    } catch (e) {
      console.log('e', e);
    }
  }
}