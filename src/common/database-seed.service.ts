import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from '../programs/entities/program.entity';
import { Instructor } from '../instructors/entities/instructor.entity';
import { Shift } from '../shifts/entities/shift.entity';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Program)
    private readonly programsRepository: Repository<Program>,
    @InjectRepository(Instructor)
    private readonly instructorsRepository: Repository<Instructor>,
    @InjectRepository(Shift)
    private readonly shiftsRepository: Repository<Shift>,
  ) {}

  async onModuleInit() {
    await this.ensurePrograms();

    const instructor = await this.ensureInstructor();
    const programs = await this.programsRepository.find({ order: { id: 'ASC' } });
    await this.ensureShifts(programs, instructor);
  }

  private async ensurePrograms() {
    const requiredPrograms = [
      {
        title: 'Горные походы',
        description: 'Трекинг, дисциплина, базовые навыки туризма и работа в команде.',
        format: 'очно',
        difficulty: 'средний',
        durationDays: 14,
        price: 28000,
        isActive: true,
      },
      {
        title: 'Борьба и ОФП',
        description: 'Тренировки по борьбе, общей физической подготовке и режиму дня.',
        format: 'очно',
        difficulty: 'средний',
        durationDays: 14,
        price: 30000,
        isActive: true,
      },
      {
        title: 'Медиашкола',
        description: 'Практика съёмки, монтажа, интервью и базовой командной медиаработы.',
        format: 'очно',
        difficulty: 'начальный',
        durationDays: 14,
        price: 26000,
        isActive: true,
      },
    ];

    for (const programData of requiredPrograms) {
      const exists = await this.programsRepository.findOne({
        where: { title: programData.title },
      });

      if (!exists) {
        await this.programsRepository.save(
          this.programsRepository.create(programData),
        );
      }
    }
  }

  private async ensureShifts(programs: Program[], instructor: Instructor) {
    const requiredShifts = [
      {
        programTitle: 'Горные походы',
        name: 'Смена по горным походам',
        startDate: '2026-06-10',
        endDate: '2026-06-24',
        capacity: 30,
        availablePlaces: 20,
        season: 'лето',
      },
      {
        programTitle: 'Борьба и ОФП',
        name: 'Смена по борьбе и ОФП',
        startDate: '2026-07-01',
        endDate: '2026-07-15',
        capacity: 30,
        availablePlaces: 18,
        season: 'лето',
      },
      {
        programTitle: 'Медиашкола',
        name: 'Смена медиашколы',
        startDate: '2026-08-01',
        endDate: '2026-08-15',
        capacity: 25,
        availablePlaces: 17,
        season: 'лето',
      },
    ];

    for (const shiftData of requiredShifts) {
      const program = programs.find((item) => item.title === shiftData.programTitle);

      if (!program) {
        continue;
      }

      const exists = await this.shiftsRepository.findOne({
        where: { name: shiftData.name, program: { id: program.id } },
        relations: { program: true },
      });

      if (!exists) {
        await this.shiftsRepository.save(
          this.shiftsRepository.create({
            name: shiftData.name,
            startDate: shiftData.startDate,
            endDate: shiftData.endDate,
            capacity: shiftData.capacity,
            availablePlaces: shiftData.availablePlaces,
            season: shiftData.season,
            program,
            instructors: [instructor],
          }),
        );
      }
    }
  }

  private async ensureInstructor() {
    const existing = await this.instructorsRepository.findOne({ where: { email: 'rasul.aliev@example.com' } });

    if (existing) {
      return existing;
    }

    return this.instructorsRepository.save(
      this.instructorsRepository.create({
        fullName: 'Расул Алиев',
        specialization: 'горный туризм',
        experienceYears: 6,
        phone: '+79990000002',
        email: 'rasul.aliev@example.com',
      }),
    );
  }
}
