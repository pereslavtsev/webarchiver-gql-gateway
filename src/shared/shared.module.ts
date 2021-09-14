import { Global, Module } from '@nestjs/common';
import { MwnModule } from '../mwn/mwn.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Global()
@Module({
  imports: [
    MwnModule.forRoot({
      apiUrl: 'https://ru.wikipedia.org/w/api.php',
      username: 'Pereslavtsev',
      password: '',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: '',
      entities: [__dirname, 'dist/**/*.model{.ts,.js}'],
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: true,
    }),
  ],
  exports: [MwnModule],
})
export class SharedModule {}
