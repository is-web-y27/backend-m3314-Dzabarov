import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Participant } from '../participants/entities/participant.entity';
import { Program } from '../programs/entities/program.entity';
import { ReviewsWebController } from './reviews.web.controller';
import { ReviewsWebService } from './reviews.web.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Participant, Program])],
  controllers: [ReviewsController, ReviewsWebController],
  providers: [ReviewsService, ReviewsWebService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
