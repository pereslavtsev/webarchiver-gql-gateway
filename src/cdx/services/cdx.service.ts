import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class CdxService {
  constructor(private httpService: HttpService) {}

  query(params): any {
    return this.httpService.axiosRef.get('/cdx/search/cdx', {
      params: {
        output: 'json',
        limit: 500,
        showResumeKey: true,
        ...params,
      },
    });
  }
}
