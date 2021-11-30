import { archiver, snapshots, sources } from '@pereslavtsev/webarchiver-protoc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Metadata } from '@grpc/grpc-js';
import { Source } from './models';
import { Task } from '../tasks';

const { ARCHIVER_SERVICE_NAME } = archiver;
const { SNAPSHOTS_SERVICE_NAME } = snapshots;
const { SOURCES_SERVICE_NAME } = sources;

@Injectable()
export class SourceListener implements OnModuleInit {
  private archiverService: archiver.ArchiverServiceClient;
  private snapshotsService: snapshots.SnapshotsServiceClient;
  private sourcesService: sources.SourcesServiceClient;

  constructor(
    @Inject('webarchiver') private client: ClientGrpc,
    private eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.sourcesService =
      this.client.getService<sources.SourcesServiceClient>(
        SOURCES_SERVICE_NAME,
      );
    this.archiverService =
      this.client.getService<archiver.ArchiverServiceClient>(
        ARCHIVER_SERVICE_NAME,
      );
    this.snapshotsService =
      this.client.getService<snapshots.SnapshotsServiceClient>(
        SNAPSHOTS_SERVICE_NAME,
      );
  }

  @OnEvent('source.matched')
  handleSourceMatchedEvent(source: Source) {
    console.log('matched', source);
    const { revisionDate: desiredDate, url, title: quote } = source;
    this.archiverService
      .createTaskStream({ desiredDate, url, quote }, new Metadata())
      .subscribe(
        (task) => {
          const { status } = task;

          console.log('vvv', task);

          switch (status) {
            case archiver.ArchiverTask_Status.PENDING: {
              this.eventEmitter.emit('source.created', {
                source,
                archiverTask: task,
              });
              break;
            }
            case archiver.ArchiverTask_Status.FAILED: {
              this.eventEmitter.emit('source.failed', {
                source,
                archiverTask: task,
              });
              break;
            }
            case archiver.ArchiverTask_Status.DONE: {
              this.eventEmitter.emit('source.checked', {
                source,
                archiverTask: task,
              });
            }
          }
        },
        (error) => console.log('er', error),
        () => {
          console.log(453543);
        },
      );
  }

  @OnEvent('source.failed')
  handleSourceFailedEvent({
    // archiverTask,
    source,
  }: {
    source: Source;
    archiverTask: Task;
  }) {
    this.sourcesService
      .discardSource(
        {
          id: source.id,
        },
        new Metadata(),
      )
      .subscribe(
        (source) => console.log('source', source),
        (error) => console.log('error', error),
      );
  }

  @OnEvent('source.checked')
  handleSourceArchivedEvent({
    archiverTask,
    source,
  }: {
    source: Source;
    archiverTask: Task;
  }) {
    console.log('{ archiverTask, source }', { archiverTask, source });
    this.snapshotsService
      .getSnapshotsStream({ taskId: archiverTask.id }, new Metadata())
      .subscribe((snapshot) => {
        console.log('snapshot', snapshot);
        const { status, uri: archiveUrl, capturedAt: archiveDate } = snapshot;

        switch (status) {
          case snapshots.Snapshot_Status.FAILED: {
            this.sourcesService
              .discardSource(
                {
                  id: source.id,
                },
                new Metadata(),
              )
              .subscribe(
                (source) => console.log('source', source),
                (error) => console.log('error', error),
              );
            break;
          }
          case snapshots.Snapshot_Status.CHECKED: {
            this.sourcesService
              .archiveSource(
                {
                  id: source.id,
                  archiveUrl,
                  archiveDate,
                },
                new Metadata(),
              )
              .subscribe(
                (source) => console.log('source', source),
                (error) => console.log('error', error),
              );
          }
        }
      });
  }
}
