import { Controller, Get, Param, ParseIntPipe, Render } from '@nestjs/common';
import { PublicAccess } from '../auth/decorators/public-access.decorator';
import { baseView } from '../common/view';
import { ProgramsWebService } from './programs.web.service';

@PublicAccess()
@Controller('programs')
export class ProgramsWebController {
  private readonly images: Record<string, string> = {
    'Горные походы': '/images/1.jpg',
    'Борьба и ОФП': '/images/2.jpg',
    Медиашкола: '/images/3.jpeg',
  };

  constructor(private readonly programsWebService: ProgramsWebService) {}

  @Get()
  @Render('programs/list')
  async findAll() {
    const programs = await this.programsWebService.findAll();

    return {
      ...baseView('Программы'),
      programs: programs.map((program) => ({
        ...program,
        image: this.images[program.title] ?? '/images/1.jpg',
      })),
    };
  }

  @Get(':id')
  @Render('programs/detail')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const program = await this.programsWebService.findOne(id);

    return {
      ...baseView(program.title),
      program: {
        ...program,
        image: this.images[program.title] ?? '/images/1.jpg',
      },
    };
  }
}
