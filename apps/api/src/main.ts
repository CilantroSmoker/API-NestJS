import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const apiPort = process.env.PORT ?? 3000;
  const frontendPort = process.env.FRONTEND_PORT ?? 5173;
  const frontendUrl = `http://localhost:${frontendPort}`;
  const frontendLocalUrl = `http://127.0.0.1:${frontendPort}`;

  app.enableCors({
    origin: [frontendUrl, frontendLocalUrl],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  await app.listen(apiPort);
  console.log(`Minimarket API corriendo en: http://localhost:${apiPort}/api`);
  console.log(`Frontend permitido en: ${frontendUrl}`);
}
bootstrap();
