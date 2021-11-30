import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { tasks } from '@pereslavtsev/webarchiver-protoc';

registerEnumType(tasks.Task_Status, {
  name: 'TaskStatus',
});

@ObjectType()
export class Task implements tasks.Task {
  static Status = tasks.Task_Status;

  @Field(() => ID)
  id: tasks.Task['id'];

  @Field(() => Int)
  pageId: number;

  @Field(() => Task.Status)
  status: tasks.Task_Status;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
