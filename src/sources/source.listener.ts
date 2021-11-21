import { archiver, core } from '@webarchiver/protoc';
import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Metadata } from '@grpc/grpc-js';

const { ARCHIVER_SERVICE_NAME, SNAPSHOTS_SERVICE_NAME } = archiver.v1;
const { SOURCES_SERVICE_NAME } = core.v1;

export class SourceListener implements OnModuleInit {
  private archiverService: archiver.v1.ArchiverServiceClient;
  private snapshotsService: archiver.v1.SnapshotsServiceClient;
  private sourcesService: core.v1.SourcesServiceClient;

  constructor(
    @Inject('ARCHIVER_PACKAGE') private archiverClient: ClientGrpc,
    @Inject('CORE_PACKAGE') private coreClient: ClientGrpc,
    private eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.sourcesService =
      this.coreClient.getService<core.v1.SourcesServiceClient>(
        SOURCES_SERVICE_NAME,
      );
    this.archiverService =
      this.archiverClient.getService<archiver.v1.ArchiverServiceClient>(
        ARCHIVER_SERVICE_NAME,
      );
    this.snapshotsService =
      this.archiverClient.getService<archiver.v1.SnapshotsServiceClient>(
        SNAPSHOTS_SERVICE_NAME,
      );
  }

  @OnEvent('source.matched')
  handleSourceMatchedEvent(source: core.v1.Source) {
    console.log('matched', source);
    const { revisionDate: desiredDate, url, title: quote } = source;
    this.archiverService
      .createTaskStream({ desiredDate, url, quote }, new Metadata())
      .subscribe(
        (task) => {
          const { status } = task;

          console.log('vvv', task);

          switch (status) {
            case archiver.v1.Task_Status.PENDING: {
              this.eventEmitter.emit('source.created', {
                source,
                archiverTask: task,
              });
              break;
            }
            case archiver.v1.Task_Status.DONE: {
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

  @OnEvent('source.checked')
  handleSourceArchivedEvent({
    archiverTask,
    source,
  }: {
    source: core.v1.Source;
    archiverTask: archiver.v1.Task;
  }) {
    console.log('{ archiverTask, source }', { archiverTask, source });
    this.snapshotsService
      .getSnapshotsStream({ taskId: archiverTask.id }, new Metadata())
      .subscribe((snapshot) => {
        console.log('snapshot', snapshot);
        const { status, uri: archiveUrl, capturedAt: archiveDate } = snapshot;

        switch (status) {
          case archiver.v1.Snapshot_Status.CHECKED: {
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
