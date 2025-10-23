import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { sessionConfig } from './config/session.config';

async function bootstrap() {
  // Start the application from the main module
  const app = await NestFactory.create(AppModule);

  // Configure session middleware
  app.use(sessionConfig);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
