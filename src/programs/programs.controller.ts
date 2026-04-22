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
  CreateProgramDto,
  ProgramListResponseDto,
  ProgramResponseDto,
  UpdateProgramDto,
} from './dto/program.dto';
import { ProgramsService } from './programs.service';
import {
  ShiftListResponseDto,
  ShiftResponseDto,
} from '../shifts/dto/shift.dto';
import {
  ReviewListResponseDto,
  ReviewResponseDto,
} from '../reviews/dto/review.dto';
import {
  ApplicationListResponseDto,
  ApplicationResponseDto,
} from '../applications/dto/application.dto';

@ApiTags('programs')
@Controller('api/programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список программ' })
  @ApiOkResponse({
    type: ProgramListResponseDto,
    headers: {
      Link: {
        description:
          'Ссылки на предыдущую и следующую страницы пагинации в формате RFC 8288',
        schema: {
          type: 'string',
          example:
            '<http://localhost:3000/api/programs?page=2&limit=10>; rel="next"',
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
    const result = await this.programsService.findAll(query);
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
  @ApiOperation({ summary: 'Получить программу по идентификатору' })
  @ApiOkResponse({ type: ProgramResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор программы',
  })
  @ApiNotFoundResponse({ description: 'Программа не найдена' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.programsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать программу' })
  @ApiCreatedResponse({ type: ProgramResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные программы' })
  create(@Body() dto: CreateProgramDto) {
    return this.programsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Изменить программу' })
  @ApiOkResponse({ type: ProgramResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор программы или данные программы',
  })
  @ApiNotFoundResponse({ description: 'Программа не найдена' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProgramDto) {
    return this.programsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить программу' })
  @ApiNoContentResponse({ description: 'Программа удалена' })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор программы',
  })
  @ApiNotFoundResponse({ description: 'Программа не найдена' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.programsService.remove(id);
  }

  @Get(':id/shifts')
  @ApiOperation({ summary: 'Получить смены программы' })
  @ApiOkResponse({
    type: ShiftListResponseDto,
    headers: {
      Link: {
        description:
          'Ссылки на предыдущую и следующую страницы пагинации в формате RFC 8288',
        schema: {
          type: 'string',
          example:
            '<http://localhost:3000/api/programs/1/shifts?page=2&limit=10>; rel="next"',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор программы или параметры пагинации',
  })
  @ApiNotFoundResponse({ description: 'Программа не найдена' })
  async findShifts(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PageQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.programsService.findShifts(id, query);
    setPaginationLinks(
      request,
      response,
      result.page,
      result.limit,
      result.totalItems,
    );
    return result;
  }

  @Get(':id/shifts/:shiftId')
  @ApiOperation({ summary: 'Получить конкретную смену программы' })
  @ApiOkResponse({ type: ShiftResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор программы или смены',
  })
  @ApiNotFoundResponse({ description: 'Программа или смена не найдены' })
  findShift(
    @Param('id', ParseIntPipe) id: number,
    @Param('shiftId', ParseIntPipe) shiftId: number,
  ) {
    return this.programsService.findShift(id, shiftId);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Получить отзывы программы' })
  @ApiOkResponse({
    type: ReviewListResponseDto,
    headers: {
      Link: {
        description:
          'Ссылки на предыдущую и следующую страницы пагинации в формате RFC 8288',
        schema: {
          type: 'string',
          example:
            '<http://localhost:3000/api/programs/1/reviews?page=2&limit=10>; rel="next"',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор программы или параметры пагинации',
  })
  @ApiNotFoundResponse({ description: 'Программа не найдена' })
  async findReviews(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PageQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.programsService.findReviews(id, query);
    setPaginationLinks(
      request,
      response,
      result.page,
      result.limit,
      result.totalItems,
    );
    return result;
  }

  @Get(':id/reviews/:reviewId')
  @ApiOperation({ summary: 'Получить конкретный отзыв программы' })
  @ApiOkResponse({ type: ReviewResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор программы или отзыва',
  })
  @ApiNotFoundResponse({ description: 'Программа или отзыв не найдены' })
  findReview(
    @Param('id', ParseIntPipe) id: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    return this.programsService.findReview(id, reviewId);
  }

  @Get(':id/applications')
  @ApiOperation({ summary: 'Получить заявки программы' })
  @ApiOkResponse({
    type: ApplicationListResponseDto,
    headers: {
      Link: {
        description:
          'Ссылки на предыдущую и следующую страницы пагинации в формате RFC 8288',
        schema: {
          type: 'string',
          example:
            '<http://localhost:3000/api/programs/1/applications?page=2&limit=10>; rel="next"',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор программы или параметры пагинации',
  })
  @ApiNotFoundResponse({ description: 'Программа не найдена' })
  async findApplications(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PageQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.programsService.findApplications(id, query);
    setPaginationLinks(
      request,
      response,
      result.page,
      result.limit,
      result.totalItems,
    );
    return result;
  }

  @Get(':id/applications/:applicationId')
  @ApiOperation({ summary: 'Получить конкретную заявку программы' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор программы или заявки',
  })
  @ApiNotFoundResponse({ description: 'Программа или заявка не найдены' })
  findApplication(
    @Param('id', ParseIntPipe) id: number,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ) {
    return this.programsService.findApplication(id, applicationId);
  }
}
