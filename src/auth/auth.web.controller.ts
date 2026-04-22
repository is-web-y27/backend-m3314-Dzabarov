import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import { PublicAccess } from './decorators/public-access.decorator';
import { baseView } from '../common/view';

type AuthFormBody = {
  email: string;
  password: string;
};

@PublicAccess()
@Controller()
export class AuthWebController {
  @Get('login')
  @Render('auth/login')
  loginPage() {
    return this.viewData();
  }

  @Get('auth')
  @Redirect('/login')
  authPage() {}

  @Post('login')
  async login(
    @Body() body: AuthFormBody,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const result = await EmailPassword.signIn(
      'public',
      body.email,
      body.password,
    );

    if (result.status !== 'OK') {
      return response.status(401).render('auth/login', {
        ...this.viewData(),
        error: 'Неверный email или пароль',
        form: { email: body.email },
      });
    }

    await Session.createNewSession(
      request,
      response,
      'public',
      result.recipeUserId,
      { email: body.email },
    );

    return response.redirect('/');
  }

  @Post('register')
  async register(
    @Body() body: AuthFormBody,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const result = await EmailPassword.signUp(
      'public',
      body.email,
      body.password,
    );

    if (result.status !== 'OK') {
      return response.status(400).render('auth/login', {
        ...this.viewData(),
        error: 'Пользователь с таким email уже существует',
        form: { email: body.email },
      });
    }

    await Session.createNewSession(
      request,
      response,
      'public',
      result.recipeUserId,
      { email: body.email },
    );

    return response.redirect('/');
  }

  @PublicAccess()
  @Post('logout')
  async logout(@Req() request: Request, @Res() response: Response) {
    const session = await Session.getSession(request, response, {
      sessionRequired: false,
    });

    if (!session) {
      return response.redirect('/');
    }

    try {
      await session.revokeSession();
    } catch {
      throw new UnauthorizedException('Authentication is required');
    }

    return response.redirect('/');
  }

  private viewData() {
    return {
      ...baseView('Войти'),
      form: { email: '' },
    };
  }
}
