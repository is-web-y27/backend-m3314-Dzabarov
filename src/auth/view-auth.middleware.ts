import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import Session from 'supertokens-node/recipe/session';
import { AUTH_MODULE_OPTIONS } from './auth.constants';
import type { AuthModuleOptions } from './auth.interfaces';
import { AuthSessionService } from './auth-session.service';
import { Role } from './roles/role.enum';

@Injectable()
export class ViewAuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(AUTH_MODULE_OPTIONS)
    private readonly options: AuthModuleOptions,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    res.locals.authLoginUrl = '/login';
    res.locals.authLogoutUrl = '/logout';

    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/graphql') ||
      req.path.startsWith(this.options.apiBasePath)
    ) {
      next();
      return;
    }

    try {
      const session = await Session.getSession(req, res, {
        sessionRequired: false,
      });

      if (session) {
        const user = await this.authSessionService.resolveUser(session);

        res.locals.authUser = {
          label: user.email ?? user.superTokensUserId,
          role: user.role,
          isAdmin: user.role === Role.Admin,
        };
      }
    } catch {
      res.locals.authUser = undefined;
    }

    next();
  }
}
