import { registerEnumType } from '@nestjs/graphql';

export enum TaskStatus {
  PENDING = 'PENDING',
  READY_TO_WRITE = 'READY_TO_WRITE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
});
