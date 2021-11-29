import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateTaskDto {
  @Field(() => ID)
  pageId: number;
}
