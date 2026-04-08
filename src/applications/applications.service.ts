import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from '../participants/entities/participant.entity';
import { Program } from '../programs/entities/program.entity';
import { Shift } from '../shifts/entities/shift.entity';
import { Application, ApplicationStatus } from './entities/application.entity';

type ApplicationPayload = {
  status: ApplicationStatus;
  medicalApproved: boolean;
  parentConsent: boolean;
  note: string | null;
  programId: number;
  shiftId: number;
  fullName: string;
  email: string;
  age: number;
  phone: string;
  city: string | null;
  telegram: string | null;
};

@Injectable()
export class ApplicationsService {
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

  async findOne(id: number) {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: {
        participant: true,
        program: true,
        shift: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Заявка не найдена');
    }

    return application;
  }

  async findFormData() {
    const programs = await this.programsRepository.find({
      order: {
        title: 'ASC',
      },
    });
    const shifts = await this.shiftsRepository.find({
      relations: {
        program: true,
      },
      order: {
        startDate: 'ASC',
      },
    });

    return { programs, shifts };
  }

  async create(payload: ApplicationPayload) {
    const participant = await this.upsertParticipant(payload);
    const program = await this.programsRepository.findOneBy({ id: payload.programId });
    const shift = await this.shiftsRepository.findOneBy({ id: payload.shiftId });

    if (!program) {
      throw new NotFoundException('Программа не найдена');
    }

    if (!shift) {
      throw new NotFoundException('Смена не найдена');
    }

    const application = this.applicationsRepository.create({
      status: payload.status,
      medicalApproved: payload.medicalApproved,
      parentConsent: payload.parentConsent,
      note: payload.note,
      participant,
      program,
      shift,
    });

    return this.applicationsRepository.save(application);
  }

  async update(id: number, payload: ApplicationPayload) {
    const application = await this.findOne(id);
    const participant = await this.upsertParticipant(
      payload,
      application.participant.id,
    );
    const program = await this.programsRepository.findOneBy({ id: payload.programId });
    const shift = await this.shiftsRepository.findOneBy({ id: payload.shiftId });

    if (!program) {
      throw new NotFoundException('Программа не найдена');
    }

    if (!shift) {
      throw new NotFoundException('Смена не найдена');
    }

    application.status = payload.status;
    application.medicalApproved = payload.medicalApproved;
    application.parentConsent = payload.parentConsent;
    application.note = payload.note;
    application.participant = participant;
    application.program = program;
    application.shift = shift;

    return this.applicationsRepository.save(application);
  }

  async remove(id: number) {
    const application = await this.findOne(id);
    await this.applicationsRepository.remove(application);
  }

  private async upsertParticipant(
    payload: ApplicationPayload,
    currentId?: number,
  ) {
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
        city: payload.city,
        telegram: payload.telegram,
      });
    } else {
      participant.fullName = payload.fullName;
      participant.email = payload.email;
      participant.age = payload.age;
      participant.phone = payload.phone;
      participant.city = payload.city;
      participant.telegram = payload.telegram;
    }

    return this.participantsRepository.save(participant);
  }
}
