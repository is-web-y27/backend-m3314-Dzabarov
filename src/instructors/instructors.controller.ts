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
import { PublicAccess } from '../auth/decorators/public-access.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles/role.enum';
import { PageQueryDto } from '../common/dto/page-query.dto';
import { setPaginationLinks } from '../common/pagination';
import {
  CreateInstructorDto,
  InstructorListResponseDto,
  InstructorResponseDto,
  UpdateInstructorDto,
} from './dto/instructor.dto';
import { InstructorsService } from './instructors.service';
import { ShiftListResponseDto, ShiftResponseDto } from '../shifts/dto/shift.dto';

@ApiTags('instructors')
@Controller('api/instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Get()
  @PublicAccess()
  @ApiOperation({ summary: 'Получить список инструкторов' })
  @ApiOkResponse({
    type: InstructorListResponseDto,
    headers: {
      Link: {
        description:
          'Ссылки на предыдущую и следующую страницы пагинации в формате RFC 8288',
        schema: {
          type: 'string',
          example:
            '<http://localhost:3000/api/instructors?page=2&limit=10>; rel="next"',
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
    const result = await this.instructorsService.findAll(query);
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
  @PublicAccess()
  @ApiOperation({ summary: 'Получить инструктора по идентификатору' })
  @ApiOkResponse({ type: InstructorResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректный идентификатор инструктора' })
  @ApiNotFoundResponse({ description: 'Инструктор не найден' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.instructorsService.findOne(id);
  }

  @Post()
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @ApiOperation({ summary: 'Создать инструктора' })
  @ApiCreatedResponse({ type: InstructorResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные инструктора' })
  create(@Body() dto: CreateInstructorDto) {
    return this.instructorsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @ApiOperation({ summary: 'Изменить инструктора' })
  @ApiOkResponse({ type: InstructorResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор инструктора или данные инструктора',
  })
  @ApiNotFoundResponse({ description: 'Инструктор не найден' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInstructorDto) {
    return this.instructorsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить инструктора' })
  @ApiNoContentResponse({ description: 'Инструктор удалён' })
  @ApiBadRequestResponse({ description: 'Некорректный идентификатор инструктора' })
  @ApiNotFoundResponse({ description: 'Инструктор не найден' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.instructorsService.remove(id);
  }

  @Get(':id/shifts')
  @PublicAccess()
  @ApiOperation({ summary: 'Получить смены инструктора' })
  @ApiOkResponse({
    type: ShiftListResponseDto,
    headers: {
      Link: {
        description:
          'Ссылки на предыдущую и следующую страницы пагинации в формате RFC 8288',
        schema: {
          type: 'string',
          example:
            '<http://localhost:3000/api/instructors/1/shifts?page=2&limit=10>; rel="next"',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор инструктора или параметры пагинации',
  })
  @ApiNotFoundResponse({ description: 'Инструктор не найден' })
  async findShifts(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PageQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.instructorsService.findShifts(id, query);
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
  @PublicAccess()
  @ApiOperation({ summary: 'Получить конкретную смену инструктора' })
  @ApiOkResponse({ type: ShiftResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор инструктора или смены',
  })
  @ApiNotFoundResponse({ description: 'Инструктор или смена не найдены' })
  findShift(
    @Param('id', ParseIntPipe) id: number,
    @Param('shiftId', ParseIntPipe) shiftId: number,
  ) {
    return this.instructorsService.findShift(id, shiftId);
  }
}
