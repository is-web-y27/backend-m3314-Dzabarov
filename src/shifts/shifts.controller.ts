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
import { ShiftsService } from './shifts.service';

type ShiftFormBody = {
  name: string;
  startDate: string;
  endDate: string;
  capacity: string;
  availablePlaces: string;
  season: string;
  programId: string;
};

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get()
  @Render('shifts/list')
  async findAll() {
    const shifts = await this.shiftsService.findAll();

    return {
      ...baseView('Смены'),
      shifts,
    };
  }

  @Get('add')
  @Render('shifts/form')
  async createPage() {
    const programs = await this.shiftsService.findPrograms();

    return {
      ...baseView('Добавить смену'),
      formTitle: 'Новая смена',
      submitLabel: 'Создать',
      action: '/shifts',
      shift: {
        name: '',
        startDate: '',
        endDate: '',
        capacity: '',
        availablePlaces: '',
        season: '',
      },
      programs: programs.map((program) => ({ ...program, selected: false })),
    };
  }

  @Get(':id')
  @Render('shifts/detail')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const shift = await this.shiftsService.findOne(id);

    return {
      ...baseView(shift.name),
      shift,
    };
  }

  @Get(':id/edit')
  @Render('shifts/form')
  async editPage(@Param('id', ParseIntPipe) id: number) {
    const shift = await this.shiftsService.findOne(id);
    const programs = await this.shiftsService.findPrograms();

    return {
      ...baseView(`Редактирование: ${shift.name}`),
      formTitle: 'Редактирование смены',
      submitLabel: 'Сохранить',
      action: `/shifts/${id}/edit`,
      shift,
      programs: programs.map((program) => ({
        ...program,
        selected: program.id === shift.program.id,
      })),
    };
  }

  @Post()
  async create(@Body() body: ShiftFormBody, @Res() res: Response) {
    const shift = await this.shiftsService.create(this.mapBody(body));
    return res.redirect(`/shifts/${shift.id}`);
  }

  @Patch(':id')
  updateApi(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ShiftFormBody,
  ) {
    return this.shiftsService.update(id, this.mapBody(body));
  }

  @Post(':id/edit')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ShiftFormBody,
    @Res() res: Response,
  ) {
    await this.shiftsService.update(id, this.mapBody(body));
    return res.redirect(`/shifts/${id}`);
  }

  @Delete(':id')
  async removeApi(@Param('id', ParseIntPipe) id: number) {
    await this.shiftsService.remove(id);
    return { success: true };
  }

  @Post(':id/delete')
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.shiftsService.remove(id);
    return res.redirect('/shifts');
  }

  private mapBody(body: ShiftFormBody) {
    return {
      name: body.name,
      startDate: body.startDate,
      endDate: body.endDate,
      capacity: Number(body.capacity),
      availablePlaces: Number(body.availablePlaces),
      season: body.season,
      programId: Number(body.programId),
    };
  }
}
