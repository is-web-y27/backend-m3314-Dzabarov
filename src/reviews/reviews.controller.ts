import {
  Body,
  Controller,
  Delete,
  Get,
  MessageEvent,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Render,
  Res,
  Sse,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { baseView } from '../common/view';
import { ReviewsService } from './reviews.service';

type ReviewFormBody = {
  rating: string;
  comment: string;
  programId: string;
  fullName: string;
  email: string;
  age: string;
  phone: string;
};

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @Render('reviews/list')
  async findAll() {
    const reviews = await this.reviewsService.findAll();

    return {
      ...baseView('Отзывы', {
        scripts: ['/js/main.js', '/js/reviews-sse.js'],
        useToastr: true,
      }),
      reviews,
    };
  }

  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.reviewsService.getEvents();
  }

  @Get('add')
  @Render('reviews/form')
  async createPage() {
    const programs = await this.reviewsService.findPrograms();

    return {
      ...baseView('Добавить отзыв'),
      formTitle: 'Новый отзыв',
      submitLabel: 'Создать',
      action: '/reviews',
      review: {
        rating: 5,
        comment: '',
        participant: {
          fullName: '',
          email: '',
          age: '',
          phone: '',
        },
      },
      programs: programs.map((program) => ({ ...program, selected: false })),
    };
  }

  @Get(':id')
  @Render('reviews/detail')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const review = await this.reviewsService.findOne(id);

    return {
      ...baseView(`Отзыв #${review.id}`),
      review,
    };
  }

  @Get(':id/edit')
  @Render('reviews/form')
  async editPage(@Param('id', ParseIntPipe) id: number) {
    const review = await this.reviewsService.findOne(id);
    const programs = await this.reviewsService.findPrograms();

    return {
      ...baseView(`Редактирование отзыва #${id}`),
      formTitle: 'Редактирование отзыва',
      submitLabel: 'Сохранить',
      action: `/reviews/${id}/edit`,
      review,
      programs: programs.map((program) => ({
        ...program,
        selected: program.id === review.program.id,
      })),
    };
  }

  @Post()
  async create(@Body() body: ReviewFormBody, @Res() res: Response) {
    const review = await this.reviewsService.create(this.mapBody(body));
    return res.redirect(`/reviews/${review.id}`);
  }

  @Patch(':id')
  updateApi(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ReviewFormBody,
  ) {
    return this.reviewsService.update(id, this.mapBody(body));
  }

  @Post(':id/edit')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ReviewFormBody,
    @Res() res: Response,
  ) {
    await this.reviewsService.update(id, this.mapBody(body));
    return res.redirect(`/reviews/${id}`);
  }

  @Delete(':id')
  async removeApi(@Param('id', ParseIntPipe) id: number) {
    await this.reviewsService.remove(id);
    return { success: true };
  }

  @Post(':id/delete')
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.reviewsService.remove(id);
    return res.redirect('/reviews');
  }

  private mapBody(body: ReviewFormBody) {
    return {
      rating: Number(body.rating),
      comment: body.comment,
      programId: Number(body.programId),
      fullName: body.fullName,
      email: body.email,
      age: Number(body.age),
      phone: body.phone,
    };
  }
}
