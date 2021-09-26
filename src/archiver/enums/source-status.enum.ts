import { registerEnumType } from '@nestjs/graphql';

export enum SourceStatus {
  PENDING = 'PENDING',
  ARCHIVED = 'ARCHIVED',
  FAILED = 'FAILED',
  UNAVAILABLE = 'UNAVAILABLE',
}

registerEnumType(SourceStatus, {
  name: 'SourceStatus',
});
