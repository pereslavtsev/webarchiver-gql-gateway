import { Injectable } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';
import { Page } from '../models/page.model';
import { SearchArgs } from '../dto/search.args';
import { InjectBot } from 'nest-mwn';
import { mwn } from 'mwn';

@Injectable()
export class PagesResolver {
  constructor(@InjectBot() private bot: mwn) {}

  @Query(() => [Page])
  async search(@Args() searchArgs: SearchArgs) {
    const { query } = await this.bot.query({
      action: 'query',
      list: 'search',
      srsearch: searchArgs.term,
      utf8: '',
    });
    return query?.search;
  }
}
