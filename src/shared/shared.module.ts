import { Global, Module, OnModuleInit } from '@nestjs/common';
import { InjectBot, MwnModule } from 'nest-mwn';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import mwnConfig from './config/mwn.config';
import { config as cdxConfig } from '../cdx';
import {
  TypeOrmConfigService,
  GqlConfigService,
  BullConfigService,
} from './services';
import { BullModule } from '@nestjs/bull';
import { GraphQLModule } from '@nestjs/graphql';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MwnConfigService } from './services/mwn-config.service';
import { LoggingModule } from '@eropple/nestjs-bunyan';
import { ROOT_LOGGER } from './utils/logger.util';
import { Logger } from './services/logger.service';
import { mwn } from 'mwn';

@Global()
@Module({
  imports: [
    LoggingModule.forRoot(ROOT_LOGGER, {}),
    ConfigModule.forRoot({
      load: [databaseConfig, cdxConfig, mwnConfig],
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    BullModule.forRootAsync({
      useClass: BullConfigService,
    }),
    MwnModule.forRootAsync({
      useClass: MwnConfigService,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    GraphQLModule.forRootAsync({
      useClass: GqlConfigService,
    }),
  ],
  providers: [Logger],
  exports: [MwnModule, Logger],
})
export class SharedModule implements OnModuleInit {
  constructor(@InjectBot() private readonly bot: mwn) {}

  async onModuleInit(): Promise<void> {
    await this.bot.login();
  }
}
