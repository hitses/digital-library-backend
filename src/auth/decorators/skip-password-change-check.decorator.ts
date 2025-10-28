import { SetMetadata } from '@nestjs/common';

export const SkipPasswordChangeCheck = () =>
  SetMetadata('skipPasswordCheck', true);
