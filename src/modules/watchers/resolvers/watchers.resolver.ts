import { Args, Query, Resolver } from '@nestjs/graphql';
import { GrpcClientProvider } from '../../shared';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { map, Observable } from 'rxjs';
import { Watcher } from '../models';
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

  @Query(() => Watcher, { name: 'watcher' })
  getWatcher(@Args() { id }: GetWatcherArgs): Observable<Watcher> {
    return this.watchersService
      .getWatcher({ id }, new Metadata())
      .pipe(map((watcher) => plainToClass(Watcher, watcher)));
  }

  @Query(() => Watcher)
  runWatcher(@Args() { id }: GetWatcherArgs): Observable<Watcher> {
    return this.watchersService
      .runWatcher({ id }, new Metadata())
      .pipe(map((watcher) => plainToClass(Watcher, watcher)));
  }

  @Query(() => Watcher)
  pauseWatcher(@Args() { id }: GetWatcherArgs): Observable<Watcher> {
    return this.watchersService
      .pauseWatcher({ id }, new Metadata())
      .pipe(map((watcher) => plainToClass(Watcher, watcher)));
  }

  @Query(() => Watcher)
  stopWatcher(@Args() { id }: GetWatcherArgs): Observable<Watcher> {
    return this.watchersService
      .stopWatcher({ id }, new Metadata())
      .pipe(map((watcher) => plainToClass(Watcher, watcher)));
  }
}
