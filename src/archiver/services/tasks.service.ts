import { Injectable } from '@nestjs/common';
import { Task } from '../models/task.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SourcesService } from './sources.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaginationArgs } from '../../shared/dto/pagination.args';
import { paginate } from '../../shared/pagination.util';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private sourcesService: SourcesService,
    private eventEmitter: EventEmitter2,
  ) {}

  findById(id: Task['id']) {
    return this.tasksRepository.findOneOrFail(id);
  }

  findByPageId(pageId: Task['pageId']) {
    return this.tasksRepository.findOneOrFail({
      where: {
        pageId,
      },
    });
  }

  async findPaginated(paginationArgs: PaginationArgs) {
    console.log('paginationArgs', paginationArgs);
    const query = await this.tasksRepository.createQueryBuilder().select();
    return paginate(query, paginationArgs);
  }

  async create(task: Task) {
    if (!task.sources.length) {
      return null;
    }
    try {
      return await this.tasksRepository.save(task);
    } catch (error) {
      console.log('error', error);
    }
  }
}
