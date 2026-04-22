import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { ProgramsService } from './programs.service';
import {
  PaginationInput,
  ProgramType,
  ProgramsPageType,
  toProgramType,
} from '../graphql.types';

@Resolver(() => ProgramType)
export class ProgramsResolver {
  constructor(private readonly programsService: ProgramsService) {}

  @Query(() => ProgramsPageType, {
    name: 'programs',
    description: 'Возвращает список программ с пагинацией.',
  })
  async programs(
    @Args('pagination', {
      type: () => PaginationInput,
      nullable: true,
    })
    pagination?: PaginationInput,
  ): Promise<ProgramsPageType> {
    const result = await this.programsService.findAll(pagination ?? {});

    return {
      ...result,
      items: result.items.map((item) => toProgramType(item)),
    };
  }

  @Query(() => ProgramType, {
    name: 'program',
    description: 'Возвращает программу по идентификатору.',
  })
  async program(
    @Args('id', { type: () => Int })
    id: number,
  ): Promise<ProgramType> {
    return toProgramType(await this.programsService.findOne(id));
  }
}
