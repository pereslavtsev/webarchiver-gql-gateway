import { Process, Processor } from '@nestjs/bull';
import { InjectBot } from 'nest-mwn';
import { ApiRevision, mwn } from 'mwn';
import { Job } from 'bull';
import { Task } from '../models/task.model';
import { DateTime } from 'luxon';
import { SourceStatus } from '../enums/source-status.enum';

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

      const archivedSources = task.sources.filter(
        (source) => source.status === SourceStatus.ARCHIVED,
      );

      const wkt = new this.bot.wikitext(content);
      const templates = wkt.parseTemplates({
        namePredicate: (name) => name.toLowerCase() === 'cite web',
        templatePredicate: (template) =>
          archivedSources
            .map((source) => source.url)
            .includes(template.getParam('url').value),
      });
      let currentContent = wkt.getText();
      for (const template of templates) {
        const oldWikitext = template.wikitext.slice();
        const url = template.getParam('url').value;
        const source = archivedSources.find((source) => source.url === url);
        const archiveDate = DateTime.fromISO(
          source.archiveDate as unknown as string,
        ).toISODate();
        template.wikitext = template.wikitext.replace(
          /}}/,
          `|archive-url=${source.archiveUrl}|archive-date=${archiveDate}}}`,
        );
        currentContent = currentContent.replace(oldWikitext, template.wikitext);
      }
      console.log('currentContent', currentContent);
      const result = await this.bot.save(
        task.pageTitle,
        currentContent,
        `Архивировано источников: ${archivedSources.length}`,
        {
          minor: true,
        },
      );
      console.log('result', result);
    } catch (error) {
      console.log('error', error);
    }
  }
}
