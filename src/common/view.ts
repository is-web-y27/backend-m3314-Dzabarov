type ViewOptions = {
  scripts?: string[];
  useToastr?: boolean;
};

const menu = [
  { href: '/', label: 'Главная' },
  { href: '/programs', label: 'Программы' },
  { href: '/how-it-works', label: 'Как это работает' },
  { href: '/about', label: 'О нас' },
  { href: '/feedback', label: 'Отзывы' },
  { href: '/apply', label: 'Заявка' },
  { href: '/contacts', label: 'Контакты' },
];

export function baseView(title: string, options: ViewOptions = {}) {
  return {
    title,
    year: new Date().getFullYear(),
    headerDesc: 'Спортивно-туристические программы для подростков',
    menu,
    scripts: options.scripts ?? ['/js/main.js'],
    useToastr: options.useToastr ?? false,
  };
}
