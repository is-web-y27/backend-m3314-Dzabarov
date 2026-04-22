import { Body, Controller, Get, Post, Render, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PublicAccess } from '../auth/decorators/public-access.decorator';
import { baseView } from '../common/view';
import { ApplicationsWebService } from './applications.web.service';

type ApplicationFormBody = {
  medicalApproved?: string;
  parentConsent?: string;
  note?: string;
  programId: string;
  fullName: string;
  email: string;
  age: string;
  phone: string;
  city?: string;
  telegram?: string;
};

@PublicAccess()
@Controller('applications')
export class ApplicationsWebController {
  constructor(
    private readonly applicationsWebService: ApplicationsWebService,
  ) {}

  @Get()
  @Render('applications/list')
  async findAll() {
    const applications = await this.applicationsWebService.findAll();

    return {
      ...baseView('Заявки'),
      applications,
    };
  }

  @Get('add')
  @Render('applications/form')
  async createPage() {
    const programs = await this.applicationsWebService.findPrograms();

    return {
      ...baseView('Подать заявку'),
      programs,
      form: {
        fullName: '',
        email: '',
        age: '',
        phone: '',
        city: '',
        telegram: '',
        note: '',
      },
    };
  }

  @Post()
  async create(@Body() body: ApplicationFormBody, @Res() res: Response) {
    await this.applicationsWebService.create({
      medicalApproved: body.medicalApproved === 'on',
      parentConsent: body.parentConsent === 'on',
      note: body.note?.trim() ? body.note.trim() : null,
      programId: Number(body.programId),
      fullName: body.fullName,
      email: body.email,
      age: Number(body.age),
      phone: body.phone,
      city: body.city?.trim() ? body.city.trim() : null,
      telegram: body.telegram?.trim() ? body.telegram.trim() : null,
    });

    return res.redirect('/applications');
  }
}
