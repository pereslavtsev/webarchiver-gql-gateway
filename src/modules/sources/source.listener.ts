import {
  archiver,
  snapshots,
  Timestamp,
  toDate,
} from '@pereslavtsev/webarchiver-protoc';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Metadata } from '@grpc/grpc-js';
import { Source } from './models';
import { Task } from '../tasks';
import { GrpcClientProvider } from '../shared';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { OnSource } from './sources.decorators';
import { catchError } from 'rxjs';

@Injectable()
export class SourceListener extends GrpcClientProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @Inject('webarchiver') client: ClientGrpc,
    private eventEmitter: EventEmitter2,
  ) {
    super(rootLogger, client);
  }

  @OnSource.Matched()
  handleSourceMatchedEvent(source: Source) {
    const log = this.log.child({ reqId: `source_${source.id}` });
    const { revisionDate: desiredDate, url, title: quote } = source;

    this.archiverService
      .createTaskStream({ desiredDate, url, quote }, new Metadata())
      .subscribe(
        (task) => {
          const { status } = task;
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
        (error) =>
          log.error(
            error,
            `archive service error with url ${source.url} (${toDate(
              source.revisionDate as unknown as Timestamp,
            ).toDateString()})`,
          ),
        () => log.debug('archiver task stream completed'),
      );
  }

  @OnSource.Failed()
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

  @OnSource.Checked()
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
