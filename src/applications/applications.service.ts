import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import {
  ApplicationResponseDto,
  CreateApplicationDto,
  UpdateApplicationDto,
} from './dto/application.dto';
import { PageQueryDto } from '../common/dto/page-query.dto';
import { createPaginationResult } from '../common/pagination';
import { Participant } from '../participants/entities/participant.entity';
import { Program } from '../programs/entities/program.entity';
import { Shift } from '../shifts/entities/shift.entity';

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

  async findAll(query: PageQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [items, totalItems] = await this.applicationsRepository.findAndCount({
      relations: { participant: true, program: true, shift: true },
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

  async create(dto: CreateApplicationDto) {
    const relations = await this.getRelations(dto);
    const application = this.applicationsRepository.create({
      status: dto.status,
      medicalApproved: dto.medicalApproved,
      parentConsent: dto.parentConsent,
      note: dto.note ?? null,
      participant: relations.participant,
      program: relations.program,
      shift: relations.shift,
    });
    return this.toResponse(await this.applicationsRepository.save(application));
  }

  async update(id: number, dto: UpdateApplicationDto) {
    const application = await this.findEntity(id);
    const relations = await this.getRelations(dto, application);

    Object.assign(application, {
      status: dto.status ?? application.status,
      medicalApproved: dto.medicalApproved ?? application.medicalApproved,
      parentConsent: dto.parentConsent ?? application.parentConsent,
      note: dto.note ?? application.note,
      participant: relations.participant,
      program: relations.program,
      shift: relations.shift,
    });

    return this.toResponse(await this.applicationsRepository.save(application));
  }

  async remove(id: number) {
    const application = await this.findEntity(id);
    await this.applicationsRepository.remove(application);
  }

  private async findEntity(id: number) {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: { participant: true, program: true, shift: true },
    });

    if (!application) {
      throw new NotFoundException('Заявка не найдена');
    }

    return application;
  }

  private async getRelations(
    dto: Partial<CreateApplicationDto>,
    current?: Application,
  ) {
    const participantId = dto.participantId ?? current?.participant.id;
    const programId = dto.programId ?? current?.program.id;
    const shiftId = dto.shiftId ?? current?.shift.id;

    const [participant, program, shift] = await Promise.all([
      this.participantsRepository.findOne({ where: { id: participantId } }),
      this.programsRepository.findOne({ where: { id: programId } }),
      this.shiftsRepository.findOne({
        where: { id: shiftId },
        relations: { program: true },
      }),
    ]);

    if (!participant) {
      throw new NotFoundException('Участник не найден');
    }

    if (!program) {
      throw new NotFoundException('Программа не найдена');
    }

    if (!shift) {
      throw new NotFoundException('Смена не найдена');
    }

    if (shift.program.id !== program.id) {
      throw new BadRequestException('Смена не принадлежит выбранной программе');
    }

    return { participant, program, shift };
  }

  private toResponse(application: Application): ApplicationResponseDto {
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
