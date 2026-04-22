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
  ApplicationListResponseDto,
  ApplicationResponseDto,
  CreateApplicationDto,
  UpdateApplicationDto,
} from './dto/application.dto';
import { ApplicationsService } from './applications.service';

@ApiTags('applications')
@Controller('api/applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @ApiOperation({ summary: 'Получить список заявок' })
  @ApiOkResponse({
    type: ApplicationListResponseDto,
    headers: {
      Link: {
        description:
          'Ссылки на предыдущую и следующую страницы пагинации в формате RFC 8288',
        schema: {
          type: 'string',
          example:
            '<http://localhost:3000/api/applications?page=2&limit=10>; rel="next"',
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
    const result = await this.applicationsService.findAll(query);
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
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @ApiOperation({ summary: 'Получить заявку по идентификатору' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректный идентификатор заявки' })
  @ApiNotFoundResponse({ description: 'Заявка не найдена' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.applicationsService.findOne(id);
  }

  @Post()
  @PublicAccess()
  @ApiOperation({ summary: 'Создать заявку' })
  @ApiCreatedResponse({ type: ApplicationResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные заявки' })
  @ApiNotFoundResponse({
    description: 'Участник, программа или смена не найдены',
  })
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @ApiOperation({ summary: 'Изменить заявку' })
  @ApiOkResponse({ type: ApplicationResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор заявки или данные заявки',
  })
  @ApiNotFoundResponse({
    description: 'Заявка или связанные сущности не найдены',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить заявку' })
  @ApiNoContentResponse({ description: 'Заявка удалена' })
  @ApiBadRequestResponse({ description: 'Некорректный идентификатор заявки' })
  @ApiNotFoundResponse({ description: 'Заявка не найдена' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.applicationsService.remove(id);
  }
}
