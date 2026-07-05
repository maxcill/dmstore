import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    await seedService.run();
  } catch (error) {
    console.error('Erro ao executar o seed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
