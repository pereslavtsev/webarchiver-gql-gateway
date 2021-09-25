import { Inject, Injectable } from '@nestjs/common';
import { Snapshot } from './models/snapshot.model';
import { CdxService, config as cdxConfig } from '../cdx';
import { ConfigType } from '@nestjs/config';
import { FetchSnapshotsParams } from './interfaces';

@Injectable()
export class SnapshotsService {
  constructor(
    @Inject(cdxConfig.KEY)
    private config: ConfigType<typeof cdxConfig>,
    private cdxService: CdxService,
  ) {}

  buildUrl(snapshot: Snapshot): string {
    return `${this.config.url}/web/${snapshot.timestamp}/${snapshot.originalUrl}`;
  }

  async fetch(params: FetchSnapshotsParams) {
    const { data } = await this.cdxService.query(params);
    return data;
  }

  fetchGen(params: Omit<FetchSnapshotsParams, 'resumeKey' | 'showResumeKey'>) {
    let currentResumeKey = null;
    let done = false;
    return {
      [Symbol.asyncIterator]: () => {
        return {
          next: async () => {
            if (done) {
              return { done: true };
            }

            const { snapshots, resumeKey } = await this.fetch(
              !currentResumeKey
                ? params
                : { ...params, resumeKey: currentResumeKey },
            );
            currentResumeKey = resumeKey;

            if (!currentResumeKey && !done) {
              done = true;
            }

            return { done: false, value: snapshots };
          },
        };
      },
    };
  }
}
