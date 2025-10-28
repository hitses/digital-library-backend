/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest<TAdmin = any>(
    err: any,
    admin: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TAdmin {
    if (err || !admin) throw err || new ForbiddenException('Unauthorized');

    const skipCheck = this.reflector.get<boolean>(
      'skipPasswordCheck',
      context.getHandler(),
    );

    if (!skipCheck && admin.mustChangePassword)
      throw new ForbiddenException(
        'Password change required before proceeding',
      );

    return admin;
  }
}
