import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule, Logger } from './modules';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new Logger(),
  });
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), { groups: ['graphql'] }),
  );
  //app.useLogger(app.get(Logger));
  await app.listen(3001);
}
bootstrap();
