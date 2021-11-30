import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  archiver,
  snapshots,
  sources,
  tasks,
  watchers,
} from '@pereslavtsev/webarchiver-protoc';

const { ARCHIVER_SERVICE_NAME } = archiver;
const { SNAPSHOTS_SERVICE_NAME } = snapshots;
const { SOURCES_SERVICE_NAME } = sources;
const { TASKS_SERVICE_NAME } = tasks;
const { WATCHERS_SERVICE_NAME } = watchers;

@Injectable()
export class GrpcClientProvider
  extends LoggableProvider
  implements OnModuleInit
{
  protected archiverService: archiver.ArchiverServiceClient;
  protected snapshotsService: snapshots.SnapshotsServiceClient;
  protected sourcesService: sources.SourcesServiceClient;
  protected tasksService: tasks.TasksServiceClient;
  protected watchersService: watchers.WatchersServiceClient;

  constructor(
    @RootLogger() rootLogger: Bunyan,
    @Inject('webarchiver') private client: ClientGrpc,
  ) {
    super(rootLogger);
  }

  onModuleInit() {
    this.archiverService =
      this.client.getService<archiver.ArchiverServiceClient>(
        ARCHIVER_SERVICE_NAME,
      );
    this.snapshotsService =
      this.client.getService<snapshots.SnapshotsServiceClient>(
        SNAPSHOTS_SERVICE_NAME,
      );
    this.sourcesService =
      this.client.getService<sources.SourcesServiceClient>(
        SOURCES_SERVICE_NAME,
      );
    this.tasksService =
      this.client.getService<tasks.TasksServiceClient>(TASKS_SERVICE_NAME);
    this.watchersService =
      this.client.getService<watchers.WatchersServiceClient>(
        WATCHERS_SERVICE_NAME,
      );
  }
}
