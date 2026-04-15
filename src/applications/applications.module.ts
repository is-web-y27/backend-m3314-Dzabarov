import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Participant } from '../participants/entities/participant.entity';
import { Program } from '../programs/entities/program.entity';
import { Shift } from '../shifts/entities/shift.entity';
import { ApplicationsWebController } from './applications.web.controller';
import { ApplicationsWebService } from './applications.web.service';
import { ProgramsModule } from '../programs/programs.module';
import { ShiftsModule } from '../shifts/shifts.module';
import { ParticipantsModule } from '../participants/participants.module';
import { ApplicationsResolver } from './applications.resolver';

@Module({
  imports: [
    ProgramsModule,
    ShiftsModule,
    ParticipantsModule,
    TypeOrmModule.forFeature([Application, Participant, Program, Shift]),
  ],
  controllers: [ApplicationsController, ApplicationsWebController],
  providers: [
    ApplicationsService,
    ApplicationsWebService,
    ApplicationsResolver,
  ],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
