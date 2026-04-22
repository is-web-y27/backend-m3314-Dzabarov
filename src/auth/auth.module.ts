import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participant } from '../participants/entities/participant.entity';
import { AUTH_MODULE_OPTIONS } from './auth.constants';
import { AuthMiddleware } from './auth.middleware';
import { AuthWebController } from './auth.web.controller';
import {
  AuthModuleAsyncOptions,
  AuthModuleOptions,
} from './auth.interfaces';
import { AuthSessionService } from './auth-session.service';
import { ViewAuthMiddleware } from './view-auth.middleware';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SuperTokensService } from './supertokens.service';

@Module({})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware, ViewAuthMiddleware).forRoutes('*');
  }

  static forRoot(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [TypeOrmModule.forFeature([Participant])],
      controllers: [AuthWebController],
      providers: [...this.createProviders(options)],
      exports: [AuthSessionService],
    };
  }

  static forRootAsync(options: AuthModuleAsyncOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        ...(options.imports ?? []),
        TypeOrmModule.forFeature([Participant]),
      ],
      controllers: [AuthWebController],
      providers: [
        {
          provide: AUTH_MODULE_OPTIONS,
          inject: options.inject ?? [],
          useFactory: options.useFactory,
        },
        SuperTokensService,
        AuthMiddleware,
        ViewAuthMiddleware,
        AuthSessionService,
        {
          provide: APP_GUARD,
          useClass: AuthGuard,
        },
        {
          provide: APP_GUARD,
          useClass: RolesGuard,
        },
      ],
      exports: [AuthSessionService],
    };
  }

  private static createProviders(options: AuthModuleOptions) {
    return [
      {
        provide: AUTH_MODULE_OPTIONS,
        useValue: options,
      },
      SuperTokensService,
      AuthMiddleware,
      ViewAuthMiddleware,
      AuthSessionService,
      {
        provide: APP_GUARD,
        useClass: AuthGuard,
      },
      {
        provide: APP_GUARD,
        useClass: RolesGuard,
      },
    ];
  }
}
