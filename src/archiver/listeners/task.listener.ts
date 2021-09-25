import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Task } from '../models/task.model';
import { TasksService } from '../services/tasks.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class TaskListener {
  constructor(
    private tasksService: TasksService,
    @InjectQueue('revisions') private revisionsQueue: Queue,
  ) {}

  @OnEvent('task.received')
  async handleTaskReceivedEvent(task: Task) {
    await this.tasksService.create(task); // add task to DB
  }

  @OnEvent('task.added')
  async handleTaskAddedEvent(task: Task) {
    await this.revisionsQueue.add(task); // add task to revisions matcher queue
  }
}
