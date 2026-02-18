import { Controller, Get, Query, Render } from '@nestjs/common';

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

function buildSession(auth?: string) {
  const isAuth = auth === '1' || auth === 'true';
  return {
    isAuth,
    username: isAuth ? 'etdev' : null,
  };
}

@Controller()
export class AppController {
  @Get()
  @Render('index')
  index(@Query('auth') auth?: string) {
    return {
      title: 'Send Him to Dagestan — Главная',
      year: new Date().getFullYear(),
      headerDesc:
        '<strong>Спортивно-туристические «лагеря закалки»</strong> на Кавказе — горы, борьба, команда и характер. Всё <em class="em">добровольно</em>, по согласию родителей и с приоритетом безопасности.',
      menu: buildMenu(),
      ...buildSession(auth),
      message: 'Страница отрендерена шаблонизатором hbs',

      gallery: [
        {
          img: '/images/1.jpg',
          alt: 'Треккинг в горах',
          title: 'Горные походы',
        },
        {
          img: '/images/2.jpg',
          alt: 'Тренировки по борьбе',
          title: 'Борьба и ОФП',
        },
        { img: '/images/3.jpeg', alt: 'Медиа занятия', title: 'Медиашкола' },
      ],
    };
  }

  @Get('about')
  @Render('about')
  about(@Query('auth') auth?: string) {
    return {
      title: 'Send Him to Dagestan — О нас',
      year: new Date().getFullYear(),
      headerDesc: 'Узнайте больше о нашей команде, миссии и принципах работы.',
      menu: buildMenu(),
      ...buildSession(auth),
    };
  }

  @Get('apply')
  @Render('apply')
  apply(@Query('auth') auth?: string) {
    return {
      title: 'Send Him to Dagestan — Подать заявку',
      year: new Date().getFullYear(),
      headerDesc:
        'Заполните форму — мы свяжемся с вами и расскажем о дальнейших шагах.',
      menu: buildMenu(),
      ...buildSession(auth),
    };
  }
}
