import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from './entities/participant.entity';
import {
  CreateParticipantDto,
  ParticipantResponseDto,
  UpdateParticipantDto,
} from './dto/participant.dto';
import { PageQueryDto } from '../common/dto/page-query.dto';
import { createPaginationResult } from '../common/pagination';
import {
  ApplicationResponseDto,
} from '../applications/dto/application.dto';
import { Application } from '../applications/entities/application.entity';
import {
  ReviewResponseDto,
} from '../reviews/dto/review.dto';
import { Review } from '../reviews/entities/review.entity';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participant)
    private readonly participantsRepository: Repository<Participant>,
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
  ) {}

  async findAll(query: PageQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [items, totalItems] = await this.participantsRepository.findAndCount({
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

  async create(dto: CreateParticipantDto) {
    const participant = this.participantsRepository.create({
      ...dto,
      city: dto.city ?? null,
      telegram: dto.telegram ?? null,
    });
    return this.toResponse(await this.participantsRepository.save(participant));
  }

  async update(id: number, dto: UpdateParticipantDto) {
    const participant = await this.findEntity(id);
    Object.assign(participant, {
      ...dto,
      city: dto.city ?? participant.city,
      telegram: dto.telegram ?? participant.telegram,
    });
    return this.toResponse(await this.participantsRepository.save(participant));
  }

  async remove(id: number) {
    const participant = await this.findEntity(id);
    await this.participantsRepository.remove(participant);
  }

  async findApplications(id: number, query: PageQueryDto) {
    await this.findEntity(id);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [items, totalItems] = await this.applicationsRepository.findAndCount({
      where: { participant: { id } },
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
      where: { id: applicationId, participant: { id } },
      relations: { participant: true, program: true, shift: true },
    });

    if (!application) {
      throw new NotFoundException('Заявка не найдена');
    }

    return this.toApplicationResponse(application);
  }

  async findReviews(id: number, query: PageQueryDto) {
    await this.findEntity(id);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [items, totalItems] = await this.reviewsRepository.findAndCount({
      where: { participant: { id } },
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
      where: { id: reviewId, participant: { id } },
      relations: { participant: true, program: true },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    return this.toReviewResponse(review);
  }

  private async findEntity(id: number) {
    const participant = await this.participantsRepository.findOne({ where: { id } });

    if (!participant) {
      throw new NotFoundException('Участник не найден');
    }

    return participant;
  }

  private toResponse(participant: Participant): ParticipantResponseDto {
    return {
      id: participant.id,
      fullName: participant.fullName,
      age: participant.age,
      email: participant.email,
      phone: participant.phone,
      city: participant.city,
      telegram: participant.telegram,
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
}
