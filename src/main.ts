import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import hbs from 'hbs';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ConfigService } from '@nestjs/config';
import supertokens from 'supertokens-node';
import { errorHandler } from 'supertokens-node/framework/express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const websiteDomain = configService.get<string>('SUPERTOKENS_WEBSITE_DOMAIN');

  app.enableCors({
    origin: websiteDomain ? [websiteDomain] : true,
    credentials: true,
    allowedHeaders: [
      'content-type',
      'authorization',
      ...supertokens.getAllCORSHeaders(),
    ],
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Camp Programs API')
    .setDescription(
      'REST API для управления программами, сменами, заявками и отзывами',
    )
    .addCookieAuth(
      'sAccessToken',
      {
        type: 'apiKey',
        in: 'cookie',
        description: 'SuperTokens access token cookie',
      },
      'supertokens',
    )
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);
  app.use(errorHandler());

  const port = Number(configService.get<string>('PORT') ?? 3000);
  await app.listen(port, '0.0.0.0');

  console.log(`Server started on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('BOOTSTRAP ERROR:', err);
});
