import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './utils/filters/http_exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable use of DTO files
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Enable filters for HTTP requests globally
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(3005);
}
bootstrap();
