import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PageQueryDto } from '../common/dto/page-query.dto';
import { setPaginationLinks } from '../common/pagination';
import {
  CreateReviewDto,
  ReviewListResponseDto,
  ReviewResponseDto,
  UpdateReviewDto,
} from './dto/review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список отзывов' })
  @ApiOkResponse({
    type: ReviewListResponseDto,
    headers: {
      Link: {
        description:
          'Ссылки на предыдущую и следующую страницы пагинации в формате RFC 8288',
        schema: {
          type: 'string',
          example:
            '<http://localhost:3000/api/reviews?page=2&limit=10>; rel="next"',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  async findAll(
    @Query() query: PageQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.reviewsService.findAll(query);
    setPaginationLinks(
      request,
      response,
      result.page,
      result.limit,
      result.totalItems,
    );
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить отзыв по идентификатору' })
  @ApiOkResponse({ type: ReviewResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректный идентификатор отзыва' })
  @ApiNotFoundResponse({ description: 'Отзыв не найден' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать отзыв' })
  @ApiCreatedResponse({ type: ReviewResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные отзыва' })
  @ApiNotFoundResponse({ description: 'Участник или программа не найдены' })
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Изменить отзыв' })
  @ApiOkResponse({ type: ReviewResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор отзыва или данные отзыва',
  })
  @ApiNotFoundResponse({
    description: 'Отзыв или связанные сущности не найдены',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить отзыв' })
  @ApiNoContentResponse({ description: 'Отзыв удалён' })
  @ApiBadRequestResponse({ description: 'Некорректный идентификатор отзыва' })
  @ApiNotFoundResponse({ description: 'Отзыв не найден' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.reviewsService.remove(id);
  }
}
