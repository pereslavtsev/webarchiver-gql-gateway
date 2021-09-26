import { Injectable } from '@nestjs/common';
import { SharedBullConfigurationFactory } from '@nestjs/bull';
import * as Bull from 'bull';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(private configService: ConfigService) {}

  createSharedConfiguration(): Bull.QueueOptions {
    return {
      redis: this.configService.get<string>('REDIS_URL'),
    };
  }
}
