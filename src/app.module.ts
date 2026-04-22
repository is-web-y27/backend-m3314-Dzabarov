import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import type { Request, Response } from 'express';
import { GraphQLError } from 'graphql';
import { join } from 'path';
import {
  createComplexityRule,
  simpleEstimator,
} from 'graphql-query-complexity';
import { AppController } from './app.controller';
import { Program } from './programs/entities/program.entity';
import { Shift } from './shifts/entities/shift.entity';
import { Instructor } from './instructors/entities/instructor.entity';
import { Participant } from './participants/entities/participant.entity';
import { Application } from './applications/entities/application.entity';
import { Review } from './reviews/entities/review.entity';
import { ProgramsModule } from './programs/programs.module';
import { ShiftsModule } from './shifts/shifts.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ApplicationsModule } from './applications/applications.module';
import { ParticipantsModule } from './participants/participants.module';
import { InstructorsModule } from './instructors/instructors.module';
import { DatabaseSeedService } from './common/database-seed.service';
import { RequestTimingInterceptor } from './common/interceptors/request-timing.interceptor';
import { ObjectStorageModule } from './object-storage/object-storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validatePredefined: false,
      validate: (config) => config,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/graphql', '/graphql/(.*)'],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/graphql',
      autoSchemaFile: join(process.cwd(), 'src', 'schema.gql'),
      sortSchema: true,
      introspection: true,
      playground: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      validationRules: [
        createComplexityRule({
          maximumComplexity: 300,
          onComplete: (complexity: number) => {
            console.log(`GraphQL query complexity: ${complexity}`);
          },
          createError: (max, actual) =>
            new GraphQLError(
              `GraphQL query is too complex: ${actual}. Maximum allowed complexity: ${max}.`,
            ),
          estimators: [simpleEstimator({ defaultComplexity: 1 })],
        }),
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [
          Program,
          Shift,
          Instructor,
          Participant,
          Application,
          Review,
        ],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    TypeOrmModule.forFeature([Program, Participant, Instructor, Shift]),
    ProgramsModule,
    ShiftsModule,
    ReviewsModule,
    ApplicationsModule,
    ParticipantsModule,
    InstructorsModule,
    ObjectStorageModule,
  ],
  controllers: [AppController],
  providers: [
    DatabaseSeedService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestTimingInterceptor,
    },
  ],
})
export class AppModule {}
