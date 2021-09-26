import { registerEnumType } from '@nestjs/graphql';

export enum SourceStatus {
  PENDING = 'PENDING',
  ARCHIVED = 'ARCHIVED',
  UNAVAILABLE = 'UNAVAILABLE',
}

registerEnumType(SourceStatus, {
  name: 'SourceStatus',
});
