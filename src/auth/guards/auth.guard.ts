import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Session from 'supertokens-node/recipe/session';
import { IS_PUBLIC_KEY } from '../auth.constants';
import { AuthSessionService } from '../auth-session.service';
import { AuthenticatedRequest } from '../interfaces/authenticated-request';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType<string>() !== 'http') {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse();

    try {
      const session = await Session.getSession(request, response);

      if (!session) {
        throw new UnauthorizedException('Authentication is required');
      }

      request.session = session;
      request.auth = await this.authSessionService.resolveUser(session);
      return true;
    } catch {
      throw new UnauthorizedException('Authentication is required');
    }
  }
}
