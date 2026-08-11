import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with explicit origins and credentials for Vercel & local dev
  app.enableCors({
    origin: ['https://masafifleetsync-react-nestjs.vercel.app', 'http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable global validation pipes for DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Request logger middleware to debug incoming frontend calls
  app.use((req, res, next) => {
    console.log(`➡️ INCOMING [${req.method}] ${req.url}`, req.body);
    next();
  });

  // Configure Swagger Documentation options
  const config = new DocumentBuilder()
    .setTitle('Masafi Fleet Sync API')
    .setDescription('The official backend documentation for Masafi Fleet Sync')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Maps Swagger UI to http://localhost:3000/api

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();