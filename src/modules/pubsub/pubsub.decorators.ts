import { Inject } from '@nestjs/common';
import { PUBSUB } from './pubsub.constants';

export function InjectPubSub() {
  return Inject(PUBSUB);
}
