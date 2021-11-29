import { OnEvent } from '@nestjs/event-emitter';

export class OnTask {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected constructor() {}

  static Accepted() {
    return OnEvent('task.accepted');
  }

  static Created() {
    return OnEvent('task.created');
  }

  static Matched() {
    return OnEvent('task.matched');
  }
}
