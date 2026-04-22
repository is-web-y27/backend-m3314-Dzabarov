import {
  Float,
  Field,
  GraphQLISODateTime,
  InputType,
  Int,
  ObjectType,
  PartialType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApplicationResponseDto } from './applications/dto/application.dto';
import { ApplicationStatus } from './applications/entities/application.entity';
import { ParticipantResponseDto } from './participants/dto/participant.dto';
import { ProgramResponseDto } from './programs/dto/program.dto';
import { ShiftResponseDto } from './shifts/dto/shift.dto';

registerEnumType(ApplicationStatus, {
  name: 'ApplicationStatus',
  description: 'Статусы заявки на участие в программе.',
});

@ObjectType({ description: 'Программа лагеря.' })
export class ProgramType {
  @Field(() => Int, { description: 'Идентификатор программы.' })
  id: number;

  @Field({ description: 'Название программы.' })
  title: string;

  @Field({ description: 'Описание программы.' })
  description: string;

  @Field({ description: 'Формат проведения программы.' })
  format: string;

  @Field({ description: 'Уровень сложности программы.' })
  difficulty: string;

  @Field(() => Int, { description: 'Продолжительность программы в днях.' })
  durationDays: number;

  @Field(() => Float, { description: 'Стоимость участия в программе.' })
  price: number;

  @Field({ description: 'Признак доступности программы для записи.' })
  isActive: boolean;
}

@ObjectType({ description: 'Смена по выбранной программе.' })
export class ShiftType {
  @Field(() => Int, { description: 'Идентификатор смены.' })
  id: number;

  @Field({ description: 'Название смены.' })
  name: string;

  @Field({ description: 'Дата начала смены.' })
  startDate: string;

  @Field({ description: 'Дата окончания смены.' })
  endDate: string;

  @Field(() => Int, { description: 'Общая вместимость смены.' })
  capacity: number;

  @Field(() => Int, { description: 'Количество свободных мест в смене.' })
  availablePlaces: number;

  @Field({ description: 'Сезон проведения смены.' })
  season: string;

  @Field(() => Int, {
    description: 'Идентификатор программы, к которой относится смена.',
  })
  programId: number;

  @Field(() => [Int], { description: 'Идентификаторы инструкторов смены.' })
  instructorIds: number[];
}

@ObjectType({ description: 'Участник лагерной программы.' })
export class ParticipantType {
  @Field(() => Int, { description: 'Идентификатор участника.' })
  id: number;

  @Field({ description: 'Полное имя участника.' })
  fullName: string;

  @Field(() => Int, { description: 'Возраст участника.' })
  age: number;

  @Field({ description: 'Электронная почта участника.' })
  email: string;

  @Field({ description: 'Телефон участника.' })
  phone: string;

  @Field(() => String, { nullable: true, description: 'Город участника.' })
  city: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'Telegram участника.',
  })
  telegram: string | null;
}

@ObjectType({ description: 'Заявка на участие в программе.' })
export class ApplicationType {
  @Field(() => Int, { description: 'Идентификатор заявки.' })
  id: number;

  @Field(() => ApplicationStatus, { description: 'Текущий статус заявки.' })
  status: ApplicationStatus;

  @Field({ description: 'Признак подтверждённого медицинского допуска.' })
  medicalApproved: boolean;

  @Field({ description: 'Признак наличия согласия родителя.' })
  parentConsent: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'Дополнительная заметка по заявке.',
  })
  note: string | null;

  @Field(() => GraphQLISODateTime, {
    description: 'Дата и время создания заявки.',
  })
  createdAt: Date;

  @Field(() => Int, { description: 'Идентификатор участника заявки.' })
  participantId: number;

  @Field(() => Int, { description: 'Идентификатор программы в заявке.' })
  programId: number;

  @Field(() => Int, { description: 'Идентификатор выбранной смены.' })
  shiftId: number;

  @Field(() => ParticipantType, {
    nullable: true,
    description: 'Участник, подавший заявку.',
  })
  participant?: ParticipantType;

  @Field(() => ProgramType, {
    nullable: true,
    description: 'Программа, на которую подана заявка.',
  })
  program?: ProgramType;

  @Field(() => ShiftType, {
    nullable: true,
    description: 'Смена, выбранная в заявке.',
  })
  shift?: ShiftType;
}

@ObjectType({ description: 'Страница со списком программ.' })
export class ProgramsPageType {
  @Field(() => [ProgramType], { description: 'Элементы текущей страницы.' })
  items: ProgramType[];

  @Field(() => Int, { description: 'Текущий номер страницы.' })
  page: number;

  @Field(() => Int, { description: 'Количество элементов на странице.' })
  limit: number;

  @Field(() => Int, { description: 'Общее количество элементов.' })
  totalItems: number;

  @Field(() => Int, { description: 'Общее количество страниц.' })
  totalPages: number;
}

@ObjectType({ description: 'Страница со списком заявок.' })
export class ApplicationsPageType {
  @Field(() => [ApplicationType], { description: 'Элементы текущей страницы.' })
  items: ApplicationType[];

  @Field(() => Int, { description: 'Текущий номер страницы.' })
  page: number;

  @Field(() => Int, { description: 'Количество элементов на странице.' })
  limit: number;

  @Field(() => Int, { description: 'Общее количество элементов.' })
  totalItems: number;

  @Field(() => Int, { description: 'Общее количество страниц.' })
  totalPages: number;
}

@InputType({ description: 'Параметры пагинации списка.' })
export class PaginationInput {
  @Field(() => Int, {
    defaultValue: 1,
    description: 'Номер страницы, начиная с единицы.',
  })
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Int, {
    defaultValue: 10,
    description: 'Количество элементов на одной странице.',
  })
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}

@InputType({ description: 'Данные для создания заявки.' })
export class CreateApplicationInput {
  @Field({
    description: 'Признак подтверждённого медицинского допуска.',
  })
  @IsBoolean()
  medicalApproved: boolean;

  @Field({
    description: 'Признак наличия согласия родителя.',
  })
  @IsBoolean()
  parentConsent: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'Дополнительная заметка к заявке.',
  })
  @IsOptional()
  @IsString()
  note?: string | null;

  @Field(() => Int, {
    description: 'Идентификатор участника, который подаёт заявку.',
  })
  @IsInt()
  @IsPositive()
  participantId: number;

  @Field(() => Int, {
    description: 'Идентификатор программы для заявки.',
  })
  @IsInt()
  @IsPositive()
  programId: number;

  @Field(() => Int, {
    description: 'Идентификатор выбранной смены.',
  })
  @IsInt()
  @IsPositive()
  shiftId: number;
}

@InputType({
  description: 'Данные для обновления заявки без изменения статуса.',
})
export class UpdateApplicationInput extends PartialType(
  CreateApplicationInput,
) {}

export function toProgramType(program: ProgramResponseDto): ProgramType {
  return { ...program };
}

export function toShiftType(shift: ShiftResponseDto): ShiftType {
  return { ...shift };
}

export function toParticipantType(
  participant: ParticipantResponseDto,
): ParticipantType {
  return { ...participant };
}

export function toApplicationType(
  application: ApplicationResponseDto,
): ApplicationType {
  return { ...application };
}
