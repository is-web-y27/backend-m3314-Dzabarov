import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Post,
  Render,
  Res,
  Sse,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { PublicAccess } from '../auth/decorators/public-access.decorator';
import { baseView } from '../common/view';
import { ReviewsWebService } from './reviews.web.service';

type ReviewFormBody = {
  rating: string;
  comment: string;
  programId: string;
  fullName: string;
  email: string;
  age: string;
  phone: string;
  city?: string;
  telegram?: string;
};

@PublicAccess()
@Controller('reviews')
export class ReviewsWebController {
  constructor(private readonly reviewsWebService: ReviewsWebService) {}

  @Get()
  @Render('reviews/list')
  async findAll() {
    const [reviews, programs] = await Promise.all([
      this.reviewsWebService.findAll(),
      this.reviewsWebService.findPrograms(),
    ]);

    return {
      ...baseView('Отзывы', {
        scripts: ['/js/main.js', '/js/reviews-sse.js'],
        useToastr: true,
      }),
      reviews,
      programs,
      form: {
        fullName: '',
        email: '',
        age: '',
        phone: '',
        city: '',
        telegram: '',
        rating: 5,
        comment: '',
      },
    };
  }

  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.reviewsWebService.getEvents();
  }

  @Post()
  async create(@Body() body: ReviewFormBody, @Res() res: Response) {
    await this.reviewsWebService.create({
      rating: Number(body.rating),
      comment: body.comment,
      programId: Number(body.programId),
      fullName: body.fullName,
      email: body.email,
      age: Number(body.age),
      phone: body.phone,
      city: body.city?.trim() ? body.city.trim() : null,
      telegram: body.telegram?.trim() ? body.telegram.trim() : null,
    });

    return res.redirect('/reviews');
  }
}
