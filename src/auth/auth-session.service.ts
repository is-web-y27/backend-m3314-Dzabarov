import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import supertokens from 'supertokens-node';
import type { SessionContainerInterface } from 'supertokens-node/recipe/session/types';
import { Repository } from 'typeorm';
import { Participant } from '../participants/entities/participant.entity';
import { AuthenticatedUser } from './interfaces/authenticated-request';
import { Role } from './roles/role.enum';

@Injectable()
export class AuthSessionService {
  constructor(
    @InjectRepository(Participant)
    private readonly participantsRepository: Repository<Participant>,
  ) {}

  async resolveUser(
    session: SessionContainerInterface,
  ): Promise<AuthenticatedUser> {
    const superTokensUserId = session.getUserId();
    const accessTokenPayload = session.getAccessTokenPayload();
    let participant = await this.participantsRepository.findOne({
      where: { superTokensUserId },
    });
    let email =
      participant?.email ??
      (typeof accessTokenPayload.email === 'string'
        ? accessTokenPayload.email
        : undefined);

    if (!participant && !email) {
      const superTokensUser = await supertokens.getUser(superTokensUserId);
      email = superTokensUser?.emails[0];
    }

    if (!participant && email) {
      participant = await this.participantsRepository.findOne({
        where: { email },
      });

      if (participant && !participant.superTokensUserId) {
        participant.superTokensUserId = superTokensUserId;
        participant = await this.participantsRepository.save(participant);
      }
    }

    return {
      superTokensUserId,
      participantId: participant?.id,
      email,
      role: participant?.role ?? Role.User,
    };
  }
}
