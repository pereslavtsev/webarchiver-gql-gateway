import { Injectable } from '@nestjs/common';
import { Task } from '../models/task.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from '../models/source.model';
import { SourcesService } from './sources.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private readonly sourcesService: SourcesService,
  ) {}

  create(pageId: Task['pageId'], urls: string[]) {
    if (!urls.length) {
      return null;
    }
    const sources = urls.map((url) => this.sourcesService.create(url));
    return this.tasksRepository.save({
      pageId,
      sources,
    });
  }
}
