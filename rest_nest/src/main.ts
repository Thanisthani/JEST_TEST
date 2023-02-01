import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.enableCors(
  //   {
  //     origin: ['http://localhost:3000'],
  //     methods: ['POST', 'PUT', 'DELETE', 'GET']
  //   }
  // );
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
});
  app.use(cookieParser());
  await app.listen(8000);
}
bootstrap();
