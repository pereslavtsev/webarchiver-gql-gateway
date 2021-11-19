import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from '../models/source.model';
import { ApiRevision, mwn } from 'mwn';
import { InjectBot } from 'nest-mwn';

export const TEMPLATES = ['cite web', 'cite news'];

@Injectable()
export class SourcesService {
  constructor(
    @InjectBot() private readonly bot: mwn,
    @InjectRepository(Source)
    private sourcesRepository: Repository<Source>,
  ) {}

  findById(id: Source['id']) {
    return this.sourcesRepository.findOneOrFail(id);
  }

  create(url: string) {
    return this.sourcesRepository.create({ url });
  }

  async update(id: Source['id'], values) {
    const source = await this.findById(id);
    return this.sourcesRepository.save({
      ...source,
      ...values,
    });
  }

  extractUnarchived(revision: ApiRevision): Source[] {
    const {
      slots: {
        main: { content },
      },
    } = revision;
    const wkt = new this.bot.wikitext(content);
    const templates = wkt.parseTemplates({
      namePredicate: (name) => TEMPLATES.includes(name.toLowerCase()),
      templatePredicate: (template) => {
        const name = String(template.name).toLowerCase();
        const isNotArchiveUrl = !template
          .getParam('url')
          .value.match(/https?:\/\/web\.archive\.org/i);
        switch (name) {
          case 'cite web': {
            return (
              !template.getParam('archiveurl') &&
              !template.getParam('archive-url') &&
              isNotArchiveUrl
            );
          }
          case 'cite news': {
            return !template.getParam('archiveurl') && isNotArchiveUrl;
          }
        }
      },
    });
    const myTemplates = [];
    for (const template of templates) {
      const source = new Source();
      source.title = template.getParam('title').value || null;
      source.url = template.getParam('url').value;
      source.templateName = template.name as string;
      source.templateWikitext = template.wikitext;
      if (myTemplates.find((t) => t.url === source.url)) {
        continue;
      }
      myTemplates.push(source);
    }

    return myTemplates;
  }
}
