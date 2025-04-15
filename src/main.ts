import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthMiddleware } from './auth/auth.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // або '*', якщо хочеш дозволити всім
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.use('/auth/profile', new AuthMiddleware().use);
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
