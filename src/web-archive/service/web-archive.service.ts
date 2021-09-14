import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class WebArchiveService {
  constructor(private httpService: HttpService) {}
}
