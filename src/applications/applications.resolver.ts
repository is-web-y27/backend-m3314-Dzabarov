import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ApplicationsService } from './applications.service';
import { ProgramsService } from '../programs/programs.service';
import { ShiftsService } from '../shifts/shifts.service';
import { ParticipantsService } from '../participants/participants.service';
import {
  ApplicationType,
  ApplicationsPageType,
  CreateApplicationInput,
  PaginationInput,
  ParticipantType,
  ProgramType,
  ShiftType,
  UpdateApplicationInput,
  toApplicationType,
  toParticipantType,
  toProgramType,
  toShiftType,
} from '../graphql.types';

@Resolver(() => ApplicationType)
export class ApplicationsResolver {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly participantsService: ParticipantsService,
    private readonly programsService: ProgramsService,
    private readonly shiftsService: ShiftsService,
  ) {}

  @Query(() => ApplicationsPageType, {
    name: 'applications',
    description: 'Возвращает список заявок с пагинацией.',
  })
  async applications(
    @Args('pagination', {
      type: () => PaginationInput,
      nullable: true,
    })
    pagination?: PaginationInput,
  ): Promise<ApplicationsPageType> {
    const result = await this.applicationsService.findAll(pagination ?? {});

    return {
      ...result,
      items: result.items.map((item) => toApplicationType(item)),
    };
  }

  @Query(() => ApplicationType, {
    name: 'application',
    description: 'Возвращает заявку по идентификатору.',
  })
  async application(
    @Args('id', { type: () => Int })
    id: number,
  ): Promise<ApplicationType> {
    return toApplicationType(await this.applicationsService.findOne(id));
  }

  @Mutation(() => ApplicationType, {
    name: 'createApplication',
    description: 'Создаёт новую заявку на участие в программе.',
  })
  async createApplication(
    @Args('input', { type: () => CreateApplicationInput })
    input: CreateApplicationInput,
  ): Promise<ApplicationType> {
    return toApplicationType(
      await this.applicationsService.create({
        ...input,
        note: input.note ?? null,
      }),
    );
  }

  @Mutation(() => ApplicationType, {
    name: 'updateApplication',
    description: 'Обновляет данные существующей заявки без смены статуса.',
  })
  async updateApplication(
    @Args('id', { type: () => Int })
    id: number,
    @Args('input', { type: () => UpdateApplicationInput })
    input: UpdateApplicationInput,
  ): Promise<ApplicationType> {
    return toApplicationType(await this.applicationsService.update(id, input));
  }

  @Mutation(() => ApplicationType, {
    name: 'approveApplication',
    description: 'Одобряет заявку.',
  })
  async approveApplication(
    @Args('id', { type: () => Int })
    id: number,
  ): Promise<ApplicationType> {
    return toApplicationType(await this.applicationsService.approve(id));
  }

  @Mutation(() => ApplicationType, {
    name: 'rejectApplication',
    description: 'Отклоняет заявку.',
  })
  async rejectApplication(
    @Args('id', { type: () => Int })
    id: number,
  ): Promise<ApplicationType> {
    return toApplicationType(await this.applicationsService.reject(id));
  }

  @Mutation(() => ApplicationType, {
    name: 'moveApplicationToWaitlist',
    description: 'Переводит заявку в лист ожидания.',
  })
  async moveApplicationToWaitlist(
    @Args('id', { type: () => Int })
    id: number,
  ): Promise<ApplicationType> {
    return toApplicationType(await this.applicationsService.moveToWaitlist(id));
  }

  @ResolveField(() => ParticipantType, {
    description: 'Участник, подавший заявку.',
  })
  async participant(
    @Parent()
    application: ApplicationType,
  ): Promise<ParticipantType> {
    return toParticipantType(
      await this.participantsService.findOne(application.participantId),
    );
  }

  @ResolveField(() => ProgramType, {
    description: 'Программа, на которую подана заявка.',
  })
  async program(@Parent() application: ApplicationType): Promise<ProgramType> {
    return toProgramType(
      await this.programsService.findOne(application.programId),
    );
  }

  @ResolveField(() => ShiftType, {
    description: 'Смена, выбранная в заявке.',
  })
  async shift(@Parent() application: ApplicationType): Promise<ShiftType> {
    return toShiftType(await this.shiftsService.findOne(application.shiftId));
  }
}
