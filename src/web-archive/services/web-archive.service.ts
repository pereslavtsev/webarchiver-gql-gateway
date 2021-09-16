import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { convertCdxJsonToPlainObject } from '../cdx.util';
import { stringify } from 'querystring';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import colorize from 'json-colorizer';

type FetchCapturesParams = {
  url: string;
  from?: string | number;
  to?: string | number;
  resumeKey?: string;
  filter?: {
    urlKey?: string;
    timestamp?: number;
    original?: string;
    mimetype?: string;
    statusCode?: number;
    digest?: string;
    length?: number;
  };
};

@Injectable()
export class WebArchiveService {
  private readonly logger = new Logger(WebArchiveService.name);

  constructor(private httpService: HttpService) {
    this.httpService.axiosRef.interceptors.request.use(
      this.onRequest.bind(this),
    );
    this.httpService.axiosRef.interceptors.response.use(
      this.onResponse.bind(this),
    );
  }

  protected onRequest(config: AxiosRequestConfig) {
    if (config.params.filter) {
      config.params.filter = Object.entries(config.params.filter).map(
        ([k, v]) => `${k.toLowerCase()}:${v}`,
      );
    }
    const requestUrl = `${config.baseURL}?${stringify(config.params)}`;
    this.logger.log(`CDX API Request to: ${requestUrl}`);
    return config;
  }

  protected onResponse(response: AxiosResponse) {
    // this.logger.log(
    //   `CDX API Response (unparsed) ${colorize(response.data, {
    //     pretty: true,
    //   })}`,
    // );
    response.data = convertCdxJsonToPlainObject(response.data);
    // this.logger.log(
    //   `CDX API Response: ${colorize(response.data, { pretty: true })}`,
    // );
    return response;
  }

  async fetchCaptures(params?: FetchCapturesParams) {
    const { data } = await this.httpService.axiosRef.request({
      params: {
        output: 'json',
        // from: 2010,
        // to: 2011,
        limit: 500,
        showResumeKey: true,
        ...params,
      },
    });
    return data;
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
