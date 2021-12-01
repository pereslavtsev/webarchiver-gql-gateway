import { NestFactory } from '@nestjs/core';
import { AppModule, Logger } from './modules';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new Logger(),
  });
  await app.listen(3001);
}
bootstrap();
