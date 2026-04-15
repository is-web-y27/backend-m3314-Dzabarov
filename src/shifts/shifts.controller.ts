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
  CreateShiftDto,
  ShiftListResponseDto,
  ShiftResponseDto,
  UpdateShiftDto,
} from './dto/shift.dto';
import { ShiftsService } from './shifts.service';
import {
  InstructorListResponseDto,
  InstructorResponseDto,
} from '../instructors/dto/instructor.dto';
import {
  ApplicationListResponseDto,
  ApplicationResponseDto,
} from '../applications/dto/application.dto';

@ApiTags('shifts')
@Controller('api/shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список смен' })
  @ApiOkResponse({
    type: ShiftListResponseDto,
    headers: {
      Link: {
        description:
          'Ссылки на предыдущую и следующую страницы пагинации в формате RFC 8288',
        schema: {
          type: 'string',
          example:
            '<http://localhost:3000/api/shifts?page=2&limit=10>; rel="next"',
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
    const result = await this.shiftsService.findAll(query);
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
  @ApiOperation({ summary: 'Получить смену по идентификатору' })
  @ApiOkResponse({ type: ShiftResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректный идентификатор смены' })
  @ApiNotFoundResponse({ description: 'Смена не найдена' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать смену' })
  @ApiCreatedResponse({ type: ShiftResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные смены' })
  @ApiNotFoundResponse({ description: 'Программа или инструкторы не найдены' })
  create(@Body() dto: CreateShiftDto) {
    return this.shiftsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Изменить смену' })
  @ApiOkResponse({ type: ShiftResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор смены или данные смены',
  })
  @ApiNotFoundResponse({ description: 'Смена или связанные сущности не найдены' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShiftDto) {
    return this.shiftsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить смену' })
  @ApiNoContentResponse({ description: 'Смена удалена' })
  @ApiBadRequestResponse({ description: 'Некорректный идентификатор смены' })
  @ApiNotFoundResponse({ description: 'Смена не найдена' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.shiftsService.remove(id);
  }

  @Get(':id/instructors')
  @ApiOperation({ summary: 'Получить инструкторов смены' })
  @ApiOkResponse({
    type: InstructorListResponseDto,
    headers: {
      Link: {
        description:
          'Ссылки на предыдущую и следующую страницы пагинации в формате RFC 8288',
        schema: {
          type: 'string',
          example:
            '<http://localhost:3000/api/shifts/1/instructors?page=2&limit=10>; rel="next"',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор смены или параметры пагинации',
  })
  @ApiNotFoundResponse({ description: 'Смена не найдена' })
  async findInstructors(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PageQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.shiftsService.findInstructors(id, query);
    setPaginationLinks(
      request,
      response,
      result.page,
      result.limit,
      result.totalItems,
    );
    return result;
  }

  @Get(':id/instructors/:instructorId')
  @ApiOperation({ summary: 'Получить конкретного инструктора смены' })
  @ApiOkResponse({ type: InstructorResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор смены или инструктора',
  })
  @ApiNotFoundResponse({ description: 'Смена или инструктор не найдены' })
  findInstructor(
    @Param('id', ParseIntPipe) id: number,
    @Param('instructorId', ParseIntPipe) instructorId: number,
  ) {
    return this.shiftsService.findInstructor(id, instructorId);
  }

  @Get(':id/applications')
  @ApiOperation({ summary: 'Получить заявки смены' })
  @ApiOkResponse({
    type: ApplicationListResponseDto,
    headers: {
      Link: {
        description:
          'Ссылки на предыдущую и следующую страницы пагинации в формате RFC 8288',
        schema: {
          type: 'string',
          example:
            '<http://localhost:3000/api/shifts/1/applications?page=2&limit=10>; rel="next"',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор смены или параметры пагинации',
  })
  @ApiNotFoundResponse({ description: 'Смена не найдена' })
  async findApplications(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PageQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.shiftsService.findApplications(id, query);
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
  @ApiOperation({ summary: 'Получить конкретную заявку смены' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор смены или заявки',
  })
  @ApiNotFoundResponse({ description: 'Смена или заявка не найдены' })
  findApplication(
    @Param('id', ParseIntPipe) id: number,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ) {
    return this.shiftsService.findApplication(id, applicationId);
  }
}
