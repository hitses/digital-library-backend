import { NestFactory } from '@nestjs/core';
import passport from 'passport';
import { AppModule } from './app.module';
import { sessionConfig } from './config/session.config';
import { corsOptions } from './config/cors.config';
import { globalValidationPipe } from './config/validation.config';

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

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
