import { ApiPage } from 'mwn';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Page implements ApiPage {
  @Field(() => ID, { name: 'id' })
  readonly pageid: number;

  @Field(() => Int)
  readonly ns: number;

  @Field()
  readonly title: string;

  readonly missing?: true;

  readonly invalid?: true;
}
