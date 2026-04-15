import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';
import { Shift } from '../shifts/entities/shift.entity';
import { Review } from '../reviews/entities/review.entity';
import { Application } from '../applications/entities/application.entity';
import { ProgramsWebController } from './programs.web.controller';
import { ProgramsWebService } from './programs.web.service';
import { ProgramsResolver } from './programs.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Program, Shift, Review, Application])],
  controllers: [ProgramsController, ProgramsWebController],
  providers: [ProgramsService, ProgramsWebService, ProgramsResolver],
  exports: [ProgramsService],
})
export class ProgramsModule {}
