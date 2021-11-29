import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { toDate, watchers } from '@pereslavtsev/webarchiver-protoc';
import { IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

registerEnumType(watchers.Watcher_Status, {
  name: 'WatcherStatus',
});

@ObjectType()
export class Watcher implements watchers.Watcher {
  static readonly Status = watchers.Watcher_Status;

  @Field(() => ID)
  @IsUUID()
  readonly id: string;

  @Field()
  readonly name: string;

  @Field(() => Watcher.Status)
  readonly status: watchers.Watcher_Status;

  @Field()
  @Transform(({ value }) => toDate(value), { groups: ['graphql'] })
  readonly createdAt: Date;

  @Field()
  @Transform(({ value }) => toDate(value), { groups: ['graphql'] })
  readonly updatedAt: Date;
}
