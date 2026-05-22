import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 1. Importe o ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. Configure o ValidationPipe Globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3002;

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
