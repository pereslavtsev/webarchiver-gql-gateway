import { InputType, PartialType, PickType } from '@nestjs/graphql';
import { Task } from '../models/task.model';

@InputType()
export class CreateTaskInput extends PickType(PartialType(Task, InputType), [
  'pageId',
] as const) {}
