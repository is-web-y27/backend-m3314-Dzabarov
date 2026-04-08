export function buildMenu() {
  return [
    { href: '/', label: 'Главная' },
    { href: '/programs', label: 'Программы' },
    { href: '/shifts', label: 'Смены' },
    { href: '/reviews', label: 'Отзывы' },
    { href: '/applications', label: 'Заявки' },
    { href: '/how-it-works', label: 'Как это работает' },
    { href: '/about', label: 'О нас' },
    { href: '/contacts', label: 'Контакты' },
  ];
}

type ViewOptions = {
  description?: string;
  scripts?: string[];
  useToastr?: boolean;
};

export function baseView(title: string, options: ViewOptions = {}) {
  return {
    title,
    year: new Date().getFullYear(),
    menu: buildMenu(),
    headerDesc: '<strong>Спортивно-туристические лагеря на Кавказе.</strong> ',
    description: options.description ?? '',
    scripts: options.scripts ?? ['/js/main.js'],
    useToastr: options.useToastr ?? false,
  };
}
