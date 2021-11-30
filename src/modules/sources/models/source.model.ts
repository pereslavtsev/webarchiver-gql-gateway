import { Field, ID, ObjectType } from '@nestjs/graphql';
import { sources } from '@pereslavtsev/webarchiver-protoc';

@ObjectType()
export class Source implements sources.Source {
  static readonly Status = sources.Source_Status;

  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  url: string;

  @Field()
  status: sources.Source_Status;

  @Field()
  revisionDate: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
