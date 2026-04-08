import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity';

type ProgramPayload = {
  title: string;
  description: string;
  format: string;
  difficulty: string;
  durationDays: number;
  price: number;
  isActive: boolean;
};

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly programsRepository: Repository<Program>,
  ) {}

  findAll() {
    return this.programsRepository.find({
      order: {
        id: 'DESC',
      },
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

    return program;
  }

  create(payload: ProgramPayload) {
    const program = this.programsRepository.create(payload);
    return this.programsRepository.save(program);
  }

  async update(id: number, payload: ProgramPayload) {
    const program = await this.findOne(id);
    Object.assign(program, payload);
    return this.programsRepository.save(program);
  }

  async remove(id: number) {
    const program = await this.findOne(id);
    await this.programsRepository.remove(program);
  }
}
