import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instructor } from './entities/instructor.entity';
import {
  CreateInstructorDto,
  InstructorResponseDto,
  UpdateInstructorDto,
} from './dto/instructor.dto';
import { PageQueryDto } from '../common/dto/page-query.dto';
import { createPaginationResult } from '../common/pagination';
import { Shift } from '../shifts/entities/shift.entity';
import { ShiftResponseDto } from '../shifts/dto/shift.dto';

@Injectable()
export class InstructorsService {
  constructor(
    @InjectRepository(Instructor)
    private readonly instructorsRepository: Repository<Instructor>,
    @InjectRepository(Shift)
    private readonly shiftsRepository: Repository<Shift>,
  ) {}

  async findAll(query: PageQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [items, totalItems] = await this.instructorsRepository.findAndCount({
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return createPaginationResult(
      items.map((item) => this.toResponse(item)),
      page,
      limit,
      totalItems,
    );
  }

  async findOne(id: number) {
    return this.toResponse(await this.findEntity(id));
  }

  async create(dto: CreateInstructorDto) {
    const instructor = this.instructorsRepository.create({
      ...dto,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
    });
    return this.toResponse(await this.instructorsRepository.save(instructor));
  }

  async update(id: number, dto: UpdateInstructorDto) {
    const instructor = await this.findEntity(id);
    Object.assign(instructor, {
      ...dto,
      phone: dto.phone ?? instructor.phone,
      email: dto.email ?? instructor.email,
    });
    return this.toResponse(await this.instructorsRepository.save(instructor));
  }

  async remove(id: number) {
    const instructor = await this.findEntity(id);
    await this.instructorsRepository.remove(instructor);
  }

  async findShifts(id: number, query: PageQueryDto) {
    await this.findEntity(id);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [items, totalItems] = await this.shiftsRepository.findAndCount({
      where: { instructors: { id } },
      relations: { program: true, instructors: true },
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return createPaginationResult(
      items.map((item) => this.toShiftResponse(item)),
      page,
      limit,
      totalItems,
    );
  }

  async findShift(id: number, shiftId: number) {
    await this.findEntity(id);
    const shift = await this.shiftsRepository.findOne({
      where: { id: shiftId, instructors: { id } },
      relations: { program: true, instructors: true },
    });

    if (!shift) {
      throw new NotFoundException('Смена не найдена');
    }

    return this.toShiftResponse(shift);
  }

  private async findEntity(id: number) {
    const instructor = await this.instructorsRepository.findOne({ where: { id } });

    if (!instructor) {
      throw new NotFoundException('Инструктор не найден');
    }

    return instructor;
  }

  private toResponse(instructor: Instructor): InstructorResponseDto {
    return {
      id: instructor.id,
      fullName: instructor.fullName,
      specialization: instructor.specialization,
      experienceYears: instructor.experienceYears,
      phone: instructor.phone,
      email: instructor.email,
    };
  }

  private toShiftResponse(shift: Shift): ShiftResponseDto {
    return {
      id: shift.id,
      name: shift.name,
      startDate: shift.startDate,
      endDate: shift.endDate,
      capacity: shift.capacity,
      availablePlaces: shift.availablePlaces,
      season: shift.season,
      programId: shift.program.id,
      instructorIds: shift.instructors.map((instructor) => instructor.id),
    };
  }
}
