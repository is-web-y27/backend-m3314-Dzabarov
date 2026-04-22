import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity';

@Injectable()
export class ProgramsWebService {
  private readonly allowedTitles = [
    'Горные походы',
    'Борьба и ОФП',
    'Медиашкола',
  ];

  constructor(
    @InjectRepository(Program)
    private readonly programsRepository: Repository<Program>,
  ) {}

  findAll() {
    return this.programsRepository.find({
      where: [
        { title: 'Горные походы' },
        { title: 'Борьба и ОФП' },
        { title: 'Медиашкола' },
      ],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const program = await this.programsRepository.findOne({
      where: { id },
      relations: {
        shifts: true,
        reviews: true,
      },
    });

    if (!program) {
      throw new NotFoundException('Программа не найдена');
    }

    if (!this.allowedTitles.includes(program.title)) {
      throw new NotFoundException('Программа не найдена');
    }

    return program;
  }
}
