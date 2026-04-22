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
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request';
import { PublicAccess } from '../auth/decorators/public-access.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles/role.enum';
import { PageQueryDto } from '../common/dto/page-query.dto';
import { setPaginationLinks } from '../common/pagination';
import {
  CreateParticipantDto,
  ParticipantListResponseDto,
  ParticipantResponseDto,
  UpdateParticipantDto,
  UpdateParticipantAuthDto,
} from './dto/participant.dto';
import { ParticipantsService } from './participants.service';
import {
  ApplicationListResponseDto,
  ApplicationResponseDto,
} from '../applications/dto/application.dto';
import {
  ReviewListResponseDto,
  ReviewResponseDto,
} from '../reviews/dto/review.dto';

@ApiTags('participants')
@Controller('api/participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Get()
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @ApiOperation({ summary: 'Получить список участников' })
  @ApiOkResponse({
    type: ParticipantListResponseDto,
    headers: {
      Link: {
        description:
          'Ссылки на предыдущую и следующую страницы пагинации в формате RFC 8288',
        schema: {
          type: 'string',
          example:
            '<http://localhost:3000/api/participants?page=2&limit=10>; rel="next"',
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
    const result = await this.participantsService.findAll(query);
    setPaginationLinks(
      request,
      response,
      result.page,
      result.limit,
      result.totalItems,
    );
    return result;
  }

  @Get('me')
  @Roles(Role.User)
  @ApiCookieAuth('supertokens')
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiOkResponse({ type: ParticipantResponseDto })
  @ApiNotFoundResponse({ description: 'Профиль участника не найден' })
  findMe(@Req() request: AuthenticatedRequest) {
    return this.participantsService.findCurrent(request.auth?.participantId);
  }

  @Patch('me')
  @Roles(Role.User)
  @ApiCookieAuth('supertokens')
  @ApiOperation({ summary: 'Изменить профиль текущего пользователя' })
  @ApiOkResponse({ type: ParticipantResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные участника' })
  @ApiNotFoundResponse({ description: 'Профиль участника не найден' })
  updateMe(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateParticipantDto,
  ) {
    return this.participantsService.updateCurrent(
      request.auth?.participantId,
      dto,
    );
  }

  @Get(':id')
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @ApiOperation({ summary: 'Получить участника по идентификатору' })
  @ApiOkResponse({ type: ParticipantResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректный идентификатор участника' })
  @ApiNotFoundResponse({ description: 'Участник не найден' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.participantsService.findOne(id);
  }

  @Post()
  @PublicAccess()
  @ApiOperation({ summary: 'Создать участника' })
  @ApiCreatedResponse({ type: ParticipantResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные участника' })
  create(@Body() dto: CreateParticipantDto) {
    return this.participantsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @ApiOperation({ summary: 'Изменить участника' })
  @ApiOkResponse({ type: ParticipantResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор участника или данные участника',
  })
  @ApiNotFoundResponse({ description: 'Участник не найден' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateParticipantAuthDto,
  ) {
    return this.participantsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить участника' })
  @ApiNoContentResponse({ description: 'Участник удалён' })
  @ApiBadRequestResponse({ description: 'Некорректный идентификатор участника' })
  @ApiNotFoundResponse({ description: 'Участник не найден' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.participantsService.remove(id);
  }

  @Get(':id/applications')
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @ApiOperation({ summary: 'Получить заявки участника' })
  @ApiOkResponse({
    type: ApplicationListResponseDto,
    headers: {
      Link: {
        description:
          'Ссылки на предыдущую и следующую страницы пагинации в формате RFC 8288',
        schema: {
          type: 'string',
          example:
            '<http://localhost:3000/api/participants/1/applications?page=2&limit=10>; rel="next"',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор участника или параметры пагинации',
  })
  @ApiNotFoundResponse({ description: 'Участник не найден' })
  async findApplications(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PageQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.participantsService.findApplications(id, query);
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
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @ApiOperation({ summary: 'Получить конкретную заявку участника' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор участника или заявки',
  })
  @ApiNotFoundResponse({ description: 'Участник или заявка не найдены' })
  findApplication(
    @Param('id', ParseIntPipe) id: number,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ) {
    return this.participantsService.findApplication(id, applicationId);
  }

  @Get(':id/reviews')
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @ApiOperation({ summary: 'Получить отзывы участника' })
  @ApiOkResponse({
    type: ReviewListResponseDto,
    headers: {
      Link: {
        description:
          'Ссылки на предыдущую и следующую страницы пагинации в формате RFC 8288',
        schema: {
          type: 'string',
          example:
            '<http://localhost:3000/api/participants/1/reviews?page=2&limit=10>; rel="next"',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор участника или параметры пагинации',
  })
  @ApiNotFoundResponse({ description: 'Участник не найден' })
  async findReviews(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PageQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.participantsService.findReviews(id, query);
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
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @ApiOperation({ summary: 'Получить конкретный отзыв участника' })
  @ApiOkResponse({ type: ReviewResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор участника или отзыва',
  })
  @ApiNotFoundResponse({ description: 'Участник или отзыв не найдены' })
  findReview(
    @Param('id', ParseIntPipe) id: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    return this.participantsService.findReview(id, reviewId);
  }
}
