import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { tasks, toDate } from '@pereslavtsev/webarchiver-protoc';
import { Transform } from 'class-transformer';

registerEnumType(tasks.Task_Status, {
  name: 'TaskStatus',
});

@ObjectType()
export class Task implements tasks.Task {
  static Status = tasks.Task_Status;

  @Field(() => ID)
  id: tasks.Task['id'];

  @Field(() => ID)
  pageId: number;

  @Field(() => Task.Status)
  status: tasks.Task_Status;

  @Field()
  @Transform(({ value }) => toDate(value), { groups: ['graphql'] })
  @Transform(({ value }) => new Date(value), { groups: ['pubsub'] })
  createdAt: Date;

  @Field()
  @Transform(({ value }) => toDate(value), { groups: ['graphql'] })
  @Transform(({ value }) => new Date(value), { groups: ['pubsub'] })
  updatedAt: Date;
}
