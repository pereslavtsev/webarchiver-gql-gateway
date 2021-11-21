import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { core } from '@webarchiver/protoc';

registerEnumType(core.v1.Task_Status, {
  name: 'TaskStatus',
});

@ObjectType()
export class Task {
  static Status = core.v1.Task_Status;

  @Field(() => ID)
  id: core.v1.Task['id'];

  @Field(() => Int)
  pageId: number;

  @Field(() => Task.Status)
  status: core.v1.Task_Status;

  // @Field()
  // createdAt: Date;
  //
  // @Field()
  // updatedAt: Date;
}
