import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  console.log('DATABASE_URL definida:', !!configService.get('DATABASE_URL'));
  console.log('DB_HOST:', configService.get('DB_HOST'));

  app.use('/api/pagamento/webhook', bodyParser.raw({ type: 'application/json' }));

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:4200'),
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`DMStore API rodando em http://localhost:${port}/api`);
}
bootstrap();
