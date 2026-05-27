import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Minimarket API')
    .setDescription('Documentacion de la API para auth, usuarios, categorias, proveedores, productos, movimientos y ventas.')
    .setVersion('1.0')
    .addServer(`http://localhost:${apiPort}`, 'API local')
    .addTag('health')
    .addTag('categorias')
    .addTag('proveedores')
    .addTag('productos')
    .addTag('movimientos')
    .addTag('ventas')
    .addTag('auth')
    .addTag('usuarios')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(apiPort);
  console.log(`Minimarket API corriendo en: http://localhost:${apiPort}/api`);
  console.log(`Swagger disponible en: http://localhost:${apiPort}/docs`);
  console.log(`Frontend permitido en: ${frontendUrl}`);
}
bootstrap();
