import { Injectable, MessageEvent, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, Subject } from 'rxjs';
import { Repository } from 'typeorm';
import { Participant } from '../participants/entities/participant.entity';
import { Program } from '../programs/entities/program.entity';
import { Review } from './entities/review.entity';

type ReviewWebPayload = {
  rating: number;
  comment: string;
  programId: number;
  fullName: string;
  email: string;
  age: number;
  phone: string;
  city: string | null;
  telegram: string | null;
};

@Injectable()
export class ReviewsWebService {
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

  findPrograms() {
    return this.programsRepository.find({
      where: [
        { title: 'Горные походы' },
        { title: 'Борьба и ОФП' },
        { title: 'Медиашкола' },
      ],
      order: {
        title: 'ASC',
      },
    });
  }

  getEvents(): Observable<MessageEvent> {
    return this.events.asObservable();
  }

  async create(payload: ReviewWebPayload) {
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
    const result = await this.reviewsRepository.findOne({
      where: { id: saved.id },
      relations: {
        participant: true,
        program: true,
      },
    });

    if (result) {
      this.events.next({
        data: {
          action: 'created',
          id: result.id,
          title: `${result.participant.fullName}: ${result.program.title}`,
        },
      });
    }

    return saved;
  }

  private async upsertParticipant(payload: ReviewWebPayload) {
    let participant = await this.participantsRepository.findOne({
      where: { email: payload.email },
    });

    if (!participant) {
      participant = this.participantsRepository.create({
        fullName: payload.fullName,
        email: payload.email,
        age: payload.age,
        phone: payload.phone,
        city: payload.city,
        telegram: payload.telegram,
      });
    } else {
      participant.fullName = payload.fullName;
      participant.age = payload.age;
      participant.phone = payload.phone;
      participant.city = payload.city;
      participant.telegram = payload.telegram;
    }

    return this.participantsRepository.save(participant);
  }
}
