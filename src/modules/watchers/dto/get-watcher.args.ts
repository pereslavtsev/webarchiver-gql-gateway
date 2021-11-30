import { ArgsType, Field, ID } from '@nestjs/graphql';
import { Watcher } from '../models';
import { IsUUID } from 'class-validator';

@ArgsType()
export class GetWatcherArgs implements Pick<Watcher, 'id'> {
  @Field(() => ID)
  @IsUUID()
  readonly id: Watcher['id'];
}
