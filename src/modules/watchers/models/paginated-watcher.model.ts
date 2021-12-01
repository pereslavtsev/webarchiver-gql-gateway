import { ObjectType } from '@nestjs/graphql';
import { Watcher } from './watcher.model';
import { Paginated } from '../../shared/paginated.types';

@ObjectType()
export class PaginatedWatcher extends Paginated(Watcher) {}
