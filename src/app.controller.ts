import { Controller, Get, Redirect, Render } from '@nestjs/common';
import { PublicAccess } from './auth/decorators/public-access.decorator';
import { baseView } from './common/view';

@PublicAccess()
@Controller()
export class AppController {
  @Get()
  @Render('index')
  index() {
    return baseView('Главная');
  }

  @Get('how-it-works')
  @Render('how-it-works')
  howItWorks() {
    return baseView('Как это работает');
  }

  @Get('about')
  @Render('about')
  about() {
    return baseView('О нас');
  }

  @Get('feedback')
  @Redirect('/reviews')
  feedback() {}

  @Get('apply')
  @Redirect('/applications/add')
  apply() {}

  @Get('contacts')
  @Render('contacts')
  contacts() {
    return baseView('Контакты');
  }
}
