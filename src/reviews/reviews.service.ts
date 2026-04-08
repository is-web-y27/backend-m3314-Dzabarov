import { Injectable, MessageEvent, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, Subject } from 'rxjs';
import { Repository } from 'typeorm';
import { Participant } from '../participants/entities/participant.entity';
import { Program } from '../programs/entities/program.entity';
import { Review } from './entities/review.entity';

type ReviewPayload = {
  rating: number;
  comment: string;
  programId: number;
  fullName: string;
  email: string;
  age: number;
  phone: string;
};

@Injectable()
export class ReviewsService {
  private readonly events = new Subject<MessageEvent>();

  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Program)
    private readonly programsRepository: Repository<Program>,
    @InjectRepository(Participant)
    private readonly participantsRepository: Repository<Participant>,
  ) {}

  findAll() {
    return this.reviewsRepository.find({
      relations: {
        participant: true,
        program: true,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: {
        participant: true,
        program: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    return review;
  }

  findPrograms() {
    return this.programsRepository.find({
      order: {
        title: 'ASC',
      },
    });
  }

  getEvents(): Observable<MessageEvent> {
    return this.events.asObservable();
  }

  async create(payload: ReviewPayload) {
    const participant = await this.upsertParticipant(payload);
    const program = await this.programsRepository.findOneBy({
      id: payload.programId,
    });

    if (!program) {
      throw new NotFoundException('Программа не найдена');
    }

    const review = this.reviewsRepository.create({
      rating: payload.rating,
      comment: payload.comment,
      participant,
      program,
    });

    const saved = await this.reviewsRepository.save(review);
    const result = await this.findOne(saved.id);
    this.emitEvent('created', result);
    return result;
  }

  async update(id: number, payload: ReviewPayload) {
    const review = await this.findOne(id);
    const participant = await this.upsertParticipant(
      payload,
      review.participant.id,
    );
    const program = await this.programsRepository.findOneBy({
      id: payload.programId,
    });

    if (!program) {
      throw new NotFoundException('Программа не найдена');
    }

    review.rating = payload.rating;
    review.comment = payload.comment;
    review.participant = participant;
    review.program = program;

    await this.reviewsRepository.save(review);
    const result = await this.findOne(id);
    this.emitEvent('updated', result);
    return result;
  }

  async remove(id: number) {
    const review = await this.findOne(id);
    const title = `${review.participant.fullName}: ${review.program.title}`;
    await this.reviewsRepository.remove(review);
    this.events.next({
      data: {
        action: 'deleted',
        id,
        title,
      },
    });
  }

  private async upsertParticipant(payload: ReviewPayload, currentId?: number) {
    let participant =
      currentId !== undefined
        ? await this.participantsRepository.findOneBy({ id: currentId })
        : await this.participantsRepository.findOne({
            where: { email: payload.email },
          });

    if (!participant) {
      participant = this.participantsRepository.create({
        fullName: payload.fullName,
        email: payload.email,
        age: payload.age,
        phone: payload.phone,
      });
    } else {
      participant.fullName = payload.fullName;
      participant.email = payload.email;
      participant.age = payload.age;
      participant.phone = payload.phone;
    }

    return this.participantsRepository.save(participant);
  }

  private emitEvent(action: string, review: Review) {
    this.events.next({
      data: {
        action,
        id: review.id,
        title: `${review.participant.fullName}: ${review.program.title}`,
      },
    });
  }
}
