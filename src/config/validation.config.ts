import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

const validationOptions: ValidationPipeOptions = {
  // The validator will remove from the validated object any property that does not use any validation decorator
  whitelist: true,
  // Instead of removing properties not included in the whitelist, the validator will throw an error
  forbidNonWhitelisted: true,
  // Automatically transforms objects in a call to be typed objects according to their DTO classes
  transform: true,
  transformOptions: {
    // The class transformer will attempt conversion according to the reflected TS type
    enableImplicitConversion: true,
  },
};

export const globalValidationPipe = new ValidationPipe(validationOptions);
