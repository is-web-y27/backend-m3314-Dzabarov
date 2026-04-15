import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import {
  CreateReviewDto,
  ReviewResponseDto,
  UpdateReviewDto,
} from './dto/review.dto';
import { PageQueryDto } from '../common/dto/page-query.dto';
import { createPaginationResult } from '../common/pagination';
import { Participant } from '../participants/entities/participant.entity';
import { Program } from '../programs/entities/program.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Participant)
    private readonly participantsRepository: Repository<Participant>,
    @InjectRepository(Program)
    private readonly programsRepository: Repository<Program>,
  ) {}

  async findAll(query: PageQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [items, totalItems] = await this.reviewsRepository.findAndCount({
      relations: { participant: true, program: true },
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

  async create(dto: CreateReviewDto) {
    const relations = await this.getRelations(dto);
    const review = this.reviewsRepository.create({
      rating: dto.rating,
      comment: dto.comment,
      participant: relations.participant,
      program: relations.program,
    });
    return this.toResponse(await this.reviewsRepository.save(review));
  }

  async update(id: number, dto: UpdateReviewDto) {
    const review = await this.findEntity(id);
    const relations = await this.getRelations(dto, review);

    Object.assign(review, {
      rating: dto.rating ?? review.rating,
      comment: dto.comment ?? review.comment,
      participant: relations.participant,
      program: relations.program,
    });

    return this.toResponse(await this.reviewsRepository.save(review));
  }

  async remove(id: number) {
    const review = await this.findEntity(id);
    await this.reviewsRepository.remove(review);
  }

  private async findEntity(id: number) {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: { participant: true, program: true },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    return review;
  }

  private async getRelations(dto: Partial<CreateReviewDto>, current?: Review) {
    const participantId = dto.participantId ?? current?.participant.id;
    const programId = dto.programId ?? current?.program.id;

    const [participant, program] = await Promise.all([
      this.participantsRepository.findOne({ where: { id: participantId } }),
      this.programsRepository.findOne({ where: { id: programId } }),
    ]);

    if (!participant) {
      throw new NotFoundException('Участник не найден');
    }

    if (!program) {
      throw new NotFoundException('Программа не найдена');
    }

    return { participant, program };
  }

  private toResponse(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      participantId: review.participant.id,
      programId: review.program.id,
    };
  }
}
