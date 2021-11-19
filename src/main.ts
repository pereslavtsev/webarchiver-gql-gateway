import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from './shared/services/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: new Logger(),
  });
  //app.useLogger(app.get(Logger));
  await app.listen(3001);
}
bootstrap();
