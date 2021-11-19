import { registerEnumType } from '@nestjs/graphql';

export enum TaskStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PROCESSED = 'PROCESSED',
  READY_TO_WRITE = 'READY_TO_WRITE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
});
