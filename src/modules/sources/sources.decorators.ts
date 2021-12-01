import { OnEvent } from '@nestjs/event-emitter';

export class OnSource {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected constructor() {}

  protected static createDecorator(event: string) {
    return OnEvent(`source.${event}`);
  }

  static Checked() {
    return this.createDecorator('checked');
  }

  static Failed() {
    return this.createDecorator('failed');
  }

  static Matched() {
    return this.createDecorator('matched');
  }
}
