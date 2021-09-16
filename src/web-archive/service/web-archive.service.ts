import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { convertCdxJsonToPlainObject } from '../cdx.util';
import querystring from 'querystring';

type FetchCapturesParams = {
  url: string;
  from?: string | number;
  to?: string | number;
  resumeKey?: string;
};

@Injectable()
export class WebArchiveService {
  constructor(private httpService: HttpService) {}

  async fetchCaptures(params?: FetchCapturesParams) {
    const { data } = await this.httpService.axiosRef.request({
      params: {
        output: 'json',
        // from: 2010,
        // to: 2011,
        limit: 3,
        showResumeKey: true,
        ...params,
      },
    });
    console.log('data', data);
    return convertCdxJsonToPlainObject(data);
  }

  fetchCapturesGen(
    params?: Omit<FetchCapturesParams, 'resumeKey' | 'showResumeKey'>,
  ) {
    let currentResumeKey = null;
    let done = false;
    return {
      [Symbol.asyncIterator]: () => {
        return {
          next: async () => {
            if (done) {
              return { done: true };
            }

            const { snapshots, resumeKey } = await this.fetchCaptures(
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
