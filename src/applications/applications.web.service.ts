import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from '../participants/entities/participant.entity';
import { Program } from '../programs/entities/program.entity';
import { Shift } from '../shifts/entities/shift.entity';
import { Application, ApplicationStatus } from './entities/application.entity';

type ApplicationWebPayload = {
  medicalApproved: boolean;
  parentConsent: boolean;
  note: string | null;
  programId: number;
  fullName: string;
  email: string;
  age: number;
  phone: string;
  city: string | null;
  telegram: string | null;
};

@Injectable()
export class ApplicationsWebService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
    @InjectRepository(Participant)
    private readonly participantsRepository: Repository<Participant>,
    @InjectRepository(Program)
    private readonly programsRepository: Repository<Program>,
    @InjectRepository(Shift)
    private readonly shiftsRepository: Repository<Shift>,
  ) {}

  findAll() {
    return this.applicationsRepository.find({
      relations: {
        participant: true,
        program: true,
        shift: true,
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

  async create(payload: ApplicationWebPayload) {
    const participant = await this.upsertParticipant(payload);
    const program = await this.programsRepository.findOneBy({
      id: payload.programId,
    });

    if (!program) {
      throw new NotFoundException('Программа не найдена');
    }

    const shift = await this.shiftsRepository.findOne({
      where: { program: { id: program.id } },
      relations: { program: true },
      order: { startDate: 'ASC' },
    });

    if (!shift) {
      throw new NotFoundException('Смена для программы не найдена');
    }

    const application = this.applicationsRepository.create({
      status: ApplicationStatus.NEW,
      medicalApproved: payload.medicalApproved,
      parentConsent: payload.parentConsent,
      note: payload.note,
      participant,
      program,
      shift,
    });

    return this.applicationsRepository.save(application);
  }

  private async upsertParticipant(payload: ApplicationWebPayload) {
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
