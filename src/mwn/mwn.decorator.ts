import { Inject } from '@nestjs/common';

import { MwnConstants } from './mwn.constants';

export function InjectBot() {
  return Inject(MwnConstants.MWN_INSTANCE);
}
