import { Request, Response, NextFunction } from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { sessionConfig } from './config/session.config';
import { corsOptions } from './config/cors.config';
import { globalValidationPipe } from './config/validation.config';
import { Logger } from '@nestjs/common';
import { healthCorsMiddleware } from './config/health-cors.middleware';

async function bootstrap() {
  // Start the application from the main module
  const app = await NestFactory.create(AppModule);

  // Middleware CORS abierto solo para /health
  app.use('/health', healthCorsMiddleware);

  // Configure session middleware
  app.use(sessionConfig);

  // Enable CORS
  app.enableCors(corsOptions);

  // Set global route prefix for all application routes
  app.setGlobalPrefix('api');

  // Enable validation of application DTOs
  app.useGlobalPipes(globalValidationPipe);

  // Enable HTTP request logging in console for development and testing environments
  if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test')
    app.useLogger(new Logger());

  // Remove X-Powered-By header from responses
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('X-Powered-By');
    next();
  });

  // Start the application on the configured port
  const port = process.env.PORT || 3000;

  await app.listen(port);

  Logger.log(
    `🚀 ${process.env.NAME} Backend running on port ${port}`,
    'NestApplication',
  );
  Logger.log(`✅ Server ready on http://localhost:${port}/`, 'NestApplication');
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
