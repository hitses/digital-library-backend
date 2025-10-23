import { NestFactory } from '@nestjs/core';
import passport from 'passport';
import { AppModule } from './app.module';
import { sessionConfig } from './config/session.config';
import { corsOptions } from './config/cors.config';
import { globalValidationPipe } from './config/validation.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Start the application from the main module
  const app = await NestFactory.create(AppModule);

  // Configure session middleware
  app.use(sessionConfig);

  // Initialize Passport and restore authentication state, if any, from the session
  app.use(passport.initialize());
  app.use(passport.session());

  // Enable CORS
  app.enableCors(corsOptions);

  // Set global route prefix for all application routes
  app.setGlobalPrefix('api');

  // Enable validation of application DTOs
  app.useGlobalPipes(globalValidationPipe);

  // Enable HTTP request logging in console for development and testing environments
  if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test')
    app.useLogger(new Logger());

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
