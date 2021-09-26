import { Injectable } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { TaskStatus } from '../enums/task-status.enum';
import { SourceStatus } from '../enums/source-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../models/task.model';
import { Source } from '../models/source.model';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SourceListener {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Source)
    private sourcesRepository: Repository<Source>,
    private eventEmitter: EventEmitter2,
    @InjectQueue('writer') private writerQueue: Queue,
  ) {}

  @OnEvent('source.archived')
  async handleSourceUpdatedEvent(event: Source) {
    const source = await this.sourcesRepository.findOne(event.id);
    const task = await source.task;
    const sources = await this.sourcesRepository.find({
      where: {
        task,
        //status: Not(SourceStatus.ARCHIVED),
      },
    });
    const unprocessedSources = sources.filter(
      (source) =>
        ![SourceStatus.ARCHIVED, SourceStatus.FAILED].includes(source.status),
    );
    console.log('unprocessedSources', unprocessedSources.length);
    if (!unprocessedSources.length) {
      await this.tasksRepository.update(
        { id: task.id },
        {
          status: TaskStatus.READY_TO_WRITE,
        },
      );
      const task1 = await this.tasksRepository.findOne(task.id);
      await this.writerQueue.add(task1);
    }
  }
}
