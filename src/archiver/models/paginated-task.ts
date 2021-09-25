/**
 * Example of paginated graphql model
 */
import { Task } from '../models/task.model';
import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../shared/types/paginated';

@ObjectType()
export class PaginatedTask extends Paginated(Task) {}
