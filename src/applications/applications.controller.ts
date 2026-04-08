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
import { ApplicationsService } from './applications.service';
import { ApplicationStatus } from './entities/application.entity';

type ApplicationFormBody = {
  status: ApplicationStatus;
  medicalApproved?: string;
  parentConsent?: string;
  note?: string;
  programId: string;
  shiftId: string;
  fullName: string;
  email: string;
  age: string;
  phone: string;
  city?: string;
  telegram?: string;
};

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @Render('applications/list')
  async findAll() {
    const applications = await this.applicationsService.findAll();

    return {
      ...baseView('Заявки'),
      applications,
    };
  }

  @Get('add')
  @Render('applications/form')
  async createPage() {
    const { programs, shifts } = await this.applicationsService.findFormData();

    return {
      ...baseView('Подать заявку'),
      formTitle: 'Новая заявка',
      submitLabel: 'Создать',
      action: '/applications',
      statuses: this.getStatuses(ApplicationStatus.NEW),
      programs: programs.map((program) => ({ ...program, selected: false })),
      shifts: shifts.map((shift) => ({
        ...shift,
        selected: false,
        label: `${shift.name} (${shift.program.title})`,
      })),
      application: {
        note: '',
        medicalApproved: false,
        parentConsent: false,
        participant: {
          fullName: '',
          email: '',
          age: '',
          phone: '',
          city: '',
          telegram: '',
        },
      },
    };
  }

  @Get(':id')
  @Render('applications/detail')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const application = await this.applicationsService.findOne(id);

    return {
      ...baseView(`Заявка #${application.id}`),
      application,
    };
  }

  @Get(':id/edit')
  @Render('applications/form')
  async editPage(@Param('id', ParseIntPipe) id: number) {
    const application = await this.applicationsService.findOne(id);
    const { programs, shifts } = await this.applicationsService.findFormData();

    return {
      ...baseView(`Редактирование заявки #${id}`),
      formTitle: 'Редактирование заявки',
      submitLabel: 'Сохранить',
      action: `/applications/${id}/edit`,
      statuses: this.getStatuses(application.status),
      programs: programs.map((program) => ({
        ...program,
        selected: program.id === application.program.id,
      })),
      shifts: shifts.map((shift) => ({
        ...shift,
        selected: shift.id === application.shift.id,
        label: `${shift.name} (${shift.program.title})`,
      })),
      application,
    };
  }

  @Post()
  async create(@Body() body: ApplicationFormBody, @Res() res: Response) {
    const application = await this.applicationsService.create(
      this.mapBody(body),
    );
    return res.redirect(`/applications/${application.id}`);
  }

  @Patch(':id')
  updateApi(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ApplicationFormBody,
  ) {
    return this.applicationsService.update(id, this.mapBody(body));
  }

  @Post(':id/edit')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ApplicationFormBody,
    @Res() res: Response,
  ) {
    await this.applicationsService.update(id, this.mapBody(body));
    return res.redirect(`/applications/${id}`);
  }

  @Delete(':id')
  async removeApi(@Param('id', ParseIntPipe) id: number) {
    await this.applicationsService.remove(id);
    return { success: true };
  }

  @Post(':id/delete')
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.applicationsService.remove(id);
    return res.redirect('/applications');
  }

  private mapBody(body: ApplicationFormBody) {
    return {
      status: body.status,
      medicalApproved: body.medicalApproved === 'on',
      parentConsent: body.parentConsent === 'on',
      note: body.note?.trim() ? body.note.trim() : null,
      programId: Number(body.programId),
      shiftId: Number(body.shiftId),
      fullName: body.fullName,
      email: body.email,
      age: Number(body.age),
      phone: body.phone,
      city: body.city?.trim() ? body.city.trim() : null,
      telegram: body.telegram?.trim() ? body.telegram.trim() : null,
    };
  }

  private getStatuses(current: ApplicationStatus) {
    return Object.values(ApplicationStatus).map((status) => ({
      value: status,
      label: status,
      selected: status === current,
    }));
  }
}
