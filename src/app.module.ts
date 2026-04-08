import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
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
    ProgramsModule,
    ShiftsModule,
    ReviewsModule,
    ApplicationsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
