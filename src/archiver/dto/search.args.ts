import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class SearchArgs {
  @Field()
  term: string;
}
