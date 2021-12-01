import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GrpcClientProvider } from '../../shared';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { map, Observable } from 'rxjs';
import { PaginatedWatcher, Watcher } from '../models';
import { Metadata } from '@grpc/grpc-js';
import { GetWatcherArgs } from '../dto';
import { plainToClass } from 'class-transformer';

@Resolver(() => Watcher)
export class WatchersResolver extends GrpcClientProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @Inject('webarchiver') client: ClientGrpc,
  ) {
    super(rootLogger, client);
  }

  @Query(() => PaginatedWatcher, { name: 'watchers' })
  getWatchers(): Observable<PaginatedWatcher> {
    return this.watchersService
      .listWatchers(
        { pageToken: '', orderBy: '', pageSize: 10 },
        new Metadata(),
      )
      .pipe(
        map(({ data, nextPageToken }) => {
          const paginated = new PaginatedWatcher();

          paginated.edges = data.map((watcher) => ({
            cursor: new Buffer(watcher.id, 'binary').toString('base64'),
            node: plainToClass(Watcher, watcher),
          }));

          paginated.totalCount = 0;
          paginated.nodes = plainToClass(Watcher, data);
          paginated.hasNextPage = !!nextPageToken;

          return paginated;
        }),
      );
  }

  @Query(() => Watcher, { name: 'watcher' })
  getWatcher(@Args() { id }: GetWatcherArgs): Observable<Watcher> {
    return this.watchersService
      .getWatcher({ id }, new Metadata())
      .pipe(map((watcher) => plainToClass(Watcher, watcher)));
  }

  @Mutation(() => Watcher)
  runWatcher(@Args() { id }: GetWatcherArgs): Observable<Watcher> {
    return this.watchersService
      .runWatcher({ id }, new Metadata())
      .pipe(map((watcher) => plainToClass(Watcher, watcher)));
  }

  @Mutation(() => Watcher)
  pauseWatcher(@Args() { id }: GetWatcherArgs): Observable<Watcher> {
    return this.watchersService
      .pauseWatcher({ id }, new Metadata())
      .pipe(map((watcher) => plainToClass(Watcher, watcher)));
  }

  @Mutation(() => Watcher)
  stopWatcher(@Args() { id }: GetWatcherArgs): Observable<Watcher> {
    return this.watchersService
      .stopWatcher({ id }, new Metadata())
      .pipe(map((watcher) => plainToClass(Watcher, watcher)));
  }
}
