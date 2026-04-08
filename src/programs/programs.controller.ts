import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Render,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { baseView } from '../common/view';
import { ProgramsService } from './programs.service';

type ProgramFormBody = {
  title: string;
  description: string;
  format: string;
  difficulty: string;
  durationDays: string;
  price: string;
  isActive?: string;
};

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  @Render('programs/list')
  async findAll() {
    const programs = await this.programsService.findAll();

    return {
      ...baseView('Программы'),
      programs,
    };
  }

  @Get('add')
  @Render('programs/form')
  createPage() {
    return {
      ...baseView('Добавить программу'),
      formTitle: 'Новая программа',
      submitLabel: 'Создать',
      action: '/programs',
      program: {
        title: '',
        description: '',
        format: '',
        difficulty: '',
        durationDays: '',
        price: '',
        isActive: true,
      },
    };
  }

  @Get(':id')
  @Render('programs/detail')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const program = await this.programsService.findOne(id);

    return {
      ...baseView(program.title),
      program,
    };
  }

  @Get(':id/edit')
  @Render('programs/form')
  async editPage(@Param('id', ParseIntPipe) id: number) {
    const program = await this.programsService.findOne(id);

    return {
      ...baseView(`Редактирование: ${program.title}`),
      formTitle: 'Редактирование программы',
      submitLabel: 'Сохранить',
      action: `/programs/${id}/edit`,
      program,
    };
  }

  @Post()
  async create(@Body() body: ProgramFormBody, @Res() res: Response) {
    const program = await this.programsService.create(this.mapBody(body));
    return res.redirect(`/programs/${program.id}`);
  }

  @Patch(':id')
  updateApi(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ProgramFormBody,
  ) {
    return this.programsService.update(id, this.mapBody(body));
  }

  @Post(':id/edit')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ProgramFormBody,
    @Res() res: Response,
  ) {
    await this.programsService.update(id, this.mapBody(body));
    return res.redirect(`/programs/${id}`);
  }

  @Delete(':id')
  async removeApi(@Param('id', ParseIntPipe) id: number) {
    await this.programsService.remove(id);
    return { success: true };
  }

  @Post(':id/delete')
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.programsService.remove(id);
    return res.redirect('/programs');
  }

  private mapBody(body: ProgramFormBody) {
    return {
      title: body.title,
      description: body.description,
      format: body.format,
      difficulty: body.difficulty,
      durationDays: Number(body.durationDays),
      price: Number(body.price),
      isActive: body.isActive === 'on',
    };
  }
}
