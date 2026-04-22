import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import {
  CreateProgramDto,
  ProgramResponseDto,
  UpdateProgramDto,
} from './dto/program.dto';
import { PageQueryDto } from '../common/dto/page-query.dto';
import { createPaginationResult } from '../common/pagination';
import { Shift } from '../shifts/entities/shift.entity';
import { Review } from '../reviews/entities/review.entity';
import { Application } from '../applications/entities/application.entity';
import { ShiftResponseDto } from '../shifts/dto/shift.dto';
import { ReviewResponseDto } from '../reviews/dto/review.dto';
import { ApplicationResponseDto } from '../applications/dto/application.dto';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly programsRepository: Repository<Program>,
    @InjectRepository(Shift)
    private readonly shiftsRepository: Repository<Shift>,
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
  ) {}

  async findAll(query: PageQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [items, totalItems] = await this.programsRepository.findAndCount({
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

  async create(dto: CreateProgramDto) {
    const program = this.programsRepository.create({
      ...dto,
      isActive: dto.isActive ?? true,
    });
    return this.toResponse(await this.programsRepository.save(program));
  }

  async update(id: number, dto: UpdateProgramDto) {
    const program = await this.findEntity(id);
    Object.assign(program, {
      ...dto,
      isActive: dto.isActive ?? program.isActive,
    });
    return this.toResponse(await this.programsRepository.save(program));
  }

  async remove(id: number) {
    const program = await this.findEntity(id);
    await this.programsRepository.remove(program);
  }

  async findShifts(id: number, query: PageQueryDto) {
    await this.findEntity(id);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [items, totalItems] = await this.shiftsRepository.findAndCount({
      where: { program: { id } },
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
      where: { id: shiftId, program: { id } },
      relations: { program: true, instructors: true },
    });

    if (!shift) {
      throw new NotFoundException('Смена не найдена');
    }

    return this.toShiftResponse(shift);
  }

  async findReviews(id: number, query: PageQueryDto) {
    await this.findEntity(id);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [items, totalItems] = await this.reviewsRepository.findAndCount({
      where: { program: { id } },
      relations: { participant: true, program: true },
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return createPaginationResult(
      items.map((item) => this.toReviewResponse(item)),
      page,
      limit,
      totalItems,
    );
  }

  async findReview(id: number, reviewId: number) {
    await this.findEntity(id);
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId, program: { id } },
      relations: { participant: true, program: true },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    return this.toReviewResponse(review);
  }

  async findApplications(id: number, query: PageQueryDto) {
    await this.findEntity(id);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [items, totalItems] = await this.applicationsRepository.findAndCount({
      where: { program: { id } },
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
      where: { id: applicationId, program: { id } },
      relations: { participant: true, program: true, shift: true },
    });

    if (!application) {
      throw new NotFoundException('Заявка не найдена');
    }

    return this.toApplicationResponse(application);
  }

  private async findEntity(id: number) {
    const program = await this.programsRepository.findOne({ where: { id } });

    if (!program) {
      throw new NotFoundException('Программа не найдена');
    }

    return program;
  }

  private toResponse(program: Program): ProgramResponseDto {
    return {
      id: program.id,
      title: program.title,
      description: program.description,
      format: program.format,
      difficulty: program.difficulty,
      durationDays: program.durationDays,
      price: Number(program.price),
      isActive: program.isActive,
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

  private toReviewResponse(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      participantId: review.participant.id,
      programId: review.program.id,
    };
  }

  private toApplicationResponse(
    application: Application,
  ): ApplicationResponseDto {
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
