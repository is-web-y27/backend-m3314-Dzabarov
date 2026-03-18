import { Controller, Get, Render } from '@nestjs/common';

function buildMenu() {
  return [
    { href: '/', label: 'Главная' },
    { href: '/programs', label: 'Программы' },
    { href: '/how-it-works', label: 'Как это работает' },
    { href: '/about', label: 'О нас' },
    { href: '/feedback', label: 'Отзывы' },
    { href: '/apply', label: 'Подать заявку' },
    { href: '/contacts', label: 'Контакты' },
  ];
}

function baseView(title: string, scripts: string[] = []) {
  return {
    title,
    year: new Date().getFullYear(),
    menu: buildMenu(),
    headerDesc:
      '<strong>Спортивно-туристические «лагеря закалки»</strong> на Кавказе — горы, борьба, команда и характер. Всё <em class="em">добровольно</em>, по согласию родителей и с приоритетом безопасности.',
    scripts,
  };
}

@Controller()
export class AppController {
  @Get()
  @Render('index')
  index() {
    return baseView('Send Him to Dagestan — Главная', ['/js/main.js']);
  }

  @Get('programs')
  @Render('programs')
  programs() {
    return baseView('Программы — Send Him to Dagestan', ['/js/main.js']);
  }

  @Get('how-it-works')
  @Render('how-it-works')
  howItWorks() {
    return baseView('Как это работает — Send Him to Dagestan', ['/js/main.js']);
  }

  @Get('about')
  @Render('about')
  about() {
    return baseView('О нас — Send Him to Dagestan', ['/js/main.js']);
  }

  @Get('feedback')
  @Render('feedback')
  feedback() {
    return baseView('Отзывы — Send Him to Dagestan', [
      '/js/feedback.js',
      '/js/main.js',
      '/js/api.js',
    ]);
  }

  @Get('apply')
  @Render('apply')
  apply() {
    return baseView('Подать заявку — Send Him to Dagestan', ['/js/main.js']);
  }

  @Get('contacts')
  @Render('contacts')
  contacts() {
    return baseView('Контакты — Send Him to Dagestan', ['/js/main.js']);
  }
}