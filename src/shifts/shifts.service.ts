import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Shift } from './entities/shift.entity';
import {
  CreateShiftDto,
  ShiftResponseDto,
  UpdateShiftDto,
} from './dto/shift.dto';
import { PageQueryDto } from '../common/dto/page-query.dto';
import { createPaginationResult } from '../common/pagination';
import { Program } from '../programs/entities/program.entity';
import { Instructor } from '../instructors/entities/instructor.entity';
import { Application } from '../applications/entities/application.entity';
import { InstructorResponseDto } from '../instructors/dto/instructor.dto';
import { ApplicationResponseDto } from '../applications/dto/application.dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftsRepository: Repository<Shift>,
    @InjectRepository(Program)
    private readonly programsRepository: Repository<Program>,
    @InjectRepository(Instructor)
    private readonly instructorsRepository: Repository<Instructor>,
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
  ) {}

  async findAll(query: PageQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [items, totalItems] = await this.shiftsRepository.findAndCount({
      relations: { program: true, instructors: true },
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

  async create(dto: CreateShiftDto) {
    const relations = await this.getRelations(dto);
    const shift = this.shiftsRepository.create({
      name: dto.name,
      startDate: dto.startDate,
      endDate: dto.endDate,
      capacity: dto.capacity,
      availablePlaces: dto.availablePlaces,
      season: dto.season,
      program: relations.program,
      instructors: relations.instructors,
    });
    return this.toResponse(await this.shiftsRepository.save(shift));
  }

  async update(id: number, dto: UpdateShiftDto) {
    const shift = await this.findEntity(id);
    const relations = await this.getRelations(dto, shift);

    Object.assign(shift, {
      name: dto.name ?? shift.name,
      startDate: dto.startDate ?? shift.startDate,
      endDate: dto.endDate ?? shift.endDate,
      capacity: dto.capacity ?? shift.capacity,
      availablePlaces: dto.availablePlaces ?? shift.availablePlaces,
      season: dto.season ?? shift.season,
      program: relations.program,
      instructors: relations.instructors,
    });

    return this.toResponse(await this.shiftsRepository.save(shift));
  }

  async remove(id: number) {
    const shift = await this.findEntity(id);
    await this.shiftsRepository.remove(shift);
  }

  async findInstructors(id: number, query: PageQueryDto) {
    await this.findEntity(id);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [items, totalItems] = await this.instructorsRepository.findAndCount({
      where: { shifts: { id } },
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return createPaginationResult(
      items.map((item) => this.toInstructorResponse(item)),
      page,
      limit,
      totalItems,
    );
  }

  async findInstructor(id: number, instructorId: number) {
    await this.findEntity(id);
    const instructor = await this.instructorsRepository.findOne({
      where: { id: instructorId, shifts: { id } },
    });

    if (!instructor) {
      throw new NotFoundException('Инструктор не найден');
    }

    return this.toInstructorResponse(instructor);
  }

  async findApplications(id: number, query: PageQueryDto) {
    await this.findEntity(id);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [items, totalItems] = await this.applicationsRepository.findAndCount({
      where: { shift: { id } },
      relations: { participant: true, program: true, shift: true },
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return createPaginationResult(
      items.map((item) => this.toApplicationResponse(item)),
      page,
      limit,
      totalItems,
    );
  }

  async findApplication(id: number, applicationId: number) {
    await this.findEntity(id);
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId, shift: { id } },
      relations: { participant: true, program: true, shift: true },
    });

    if (!application) {
      throw new NotFoundException('Заявка не найдена');
    }

    return this.toApplicationResponse(application);
  }

  private async findEntity(id: number) {
    const shift = await this.shiftsRepository.findOne({
      where: { id },
      relations: { program: true, instructors: true },
    });

    if (!shift) {
      throw new NotFoundException('Смена не найдена');
    }

    return shift;
  }

  private async getRelations(dto: Partial<CreateShiftDto>, current?: Shift) {
    const programId = dto.programId ?? current?.program.id;
    const instructorIds = dto.instructorIds ?? current?.instructors.map((item) => item.id) ?? [];

    const program = await this.programsRepository.findOne({ where: { id: programId } });

    if (!program) {
      throw new NotFoundException('Программа не найдена');
    }

    const instructors = instructorIds.length
      ? await this.instructorsRepository.find({
          where: { id: In(instructorIds) },
        })
      : [];

    if (instructors.length !== instructorIds.length) {
      throw new NotFoundException('Один или несколько инструкторов не найдены');
    }

    return { program, instructors };
  }

  private toResponse(shift: Shift): ShiftResponseDto {
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

  private toInstructorResponse(instructor: Instructor): InstructorResponseDto {
    return {
      id: instructor.id,
      fullName: instructor.fullName,
      specialization: instructor.specialization,
      experienceYears: instructor.experienceYears,
      phone: instructor.phone,
      email: instructor.email,
    };
  }

  private toApplicationResponse(application: Application): ApplicationResponseDto {
    return {
      id: application.id,
      status: application.status,
      medicalApproved: application.medicalApproved,
      parentConsent: application.parentConsent,
      note: application.note,
      createdAt: application.createdAt,
      participantId: application.participant.id,
      programId: application.program.id,
      shiftId: application.shift.id,
    };
  }
}
