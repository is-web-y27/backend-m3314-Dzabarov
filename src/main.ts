import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import hbs from 'hbs';

import { readFileSync } from 'fs';

async function bootstrap() {
  hbs.registerPartial(
    'product-card',
    readFileSync(
      join(__dirname, '..', 'views', 'partials', 'product-card.hbs'),
      'utf8',
    ),
  );
  hbs.registerPartial(
    'gallery-item',
    readFileSync(
      join(__dirname, '..', 'views', 'partials', 'gallery-item.hbs'),
      'utf8',
    ),
  );

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
