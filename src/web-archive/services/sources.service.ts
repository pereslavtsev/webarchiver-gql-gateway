import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from '../models/source.model';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(Source)
    private sourcesRepository: Repository<Source>,
  ) {}

  create(url: string) {
    return this.sourcesRepository.create({ url });
  }
}
