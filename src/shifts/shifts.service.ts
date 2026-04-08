import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from '../programs/entities/program.entity';
import { Shift } from './entities/shift.entity';

type ShiftPayload = {
  name: string;
  startDate: string;
  endDate: string;
  capacity: number;
  availablePlaces: number;
  season: string;
  programId: number;
};

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftsRepository: Repository<Shift>,
    @InjectRepository(Program)
    private readonly programsRepository: Repository<Program>,
  ) {}

  findAll() {
    return this.shiftsRepository.find({
      relations: {
        program: true,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const shift = await this.shiftsRepository.findOne({
      where: { id },
      relations: {
        program: true,
      },
    });

    if (!shift) {
      throw new NotFoundException('Смена не найдена');
    }

    return shift;
  }

  findPrograms() {
    return this.programsRepository.find({
      order: {
        title: 'ASC',
      },
    });
  }

  async create(payload: ShiftPayload) {
    const program = await this.programsRepository.findOneBy({
      id: payload.programId,
    });

    if (!program) {
      throw new NotFoundException('Программа не найдена');
    }

    const shift = this.shiftsRepository.create({
      name: payload.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
      capacity: payload.capacity,
      availablePlaces: payload.availablePlaces,
      season: payload.season,
      program,
    });

    return this.shiftsRepository.save(shift);
  }

  async update(id: number, payload: ShiftPayload) {
    const shift = await this.findOne(id);
    const program = await this.programsRepository.findOneBy({
      id: payload.programId,
    });

    if (!program) {
      throw new NotFoundException('Программа не найдена');
    }

    shift.name = payload.name;
    shift.startDate = payload.startDate;
    shift.endDate = payload.endDate;
    shift.capacity = payload.capacity;
    shift.availablePlaces = payload.availablePlaces;
    shift.season = payload.season;
    shift.program = program;

    return this.shiftsRepository.save(shift);
  }

  async remove(id: number) {
    const shift = await this.findOne(id);
    await this.shiftsRepository.remove(shift);
  }
}
