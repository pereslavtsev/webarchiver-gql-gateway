import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from '../models/source.model';
import { ApiRevision, mwn } from 'mwn';
import { InjectBot } from 'nest-mwn';

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
      namePredicate: (name) => name.toLowerCase() === 'cite web',
      templatePredicate: (template) =>
        !template.getParam('archiveurl') &&
        !template.getParam('url').value.match(/https?:\/\/web\.archive\.org/i),
    });
    const myTemplates = [];
    for (const template of templates) {
      const source = new Source();
      source.title = template.getParam('title').value || null;
      source.url = template.getParam('url').value;
      if (myTemplates.find((t) => t.url === source.url)) {
        continue;
      }
      myTemplates.push(source);
    }

    return myTemplates;
  }
}
