import { Global, Module } from '@nestjs/common';
import { MwnModule } from '../mwn/mwn.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmConfigService } from './services/type-orm-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
    }),
    MwnModule.forRoot({
      apiUrl: 'https://ru.wikipedia.org/w/api.php',
      username: 'Pereslavtsev',
      password: '',
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
  ],
  exports: [MwnModule],
})
export class SharedModule {}
