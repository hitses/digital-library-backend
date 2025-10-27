import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export const CurrentAdmin = createParamDecorator(
  <T extends keyof JwtPayload>(
    data: T | undefined,
    ctx: ExecutionContext,
  ): JwtPayload | JwtPayload[T] => {
    const request = ctx.switchToHttp().getRequest();
    const admin: JwtPayload = request.user;

    if (!admin)
      throw new InternalServerErrorException(
        'Admin not found in request (JwtAuthGuard)',
      );

    return data ? admin[data] : admin;
  },
);
