import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Task } from '../models/task.model';
import { TasksService } from '../services/tasks.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { TaskStatus } from '../enums/task-status.enum';

@Injectable()
export class TaskListener {
  constructor(
    private tasksService: TasksService,
    @InjectQueue('revisions') private revisionsQueue: Queue,
    @InjectQueue('pages') private pagesQueue: Queue,
  ) {}

  @OnEvent('task.processed')
  async handleTaskReceivedEvent(task: Task) {
    const updatedTask = await this.tasksService.update(task.id, {
      ...task,
      status: TaskStatus.PROCESSED,
    });
    await this.revisionsQueue.add(updatedTask);
  }

  @OnEvent('task.added')
  async handleTaskAddedEvent(task: Task) {
    await this.pagesQueue.add(task);
  }
}
