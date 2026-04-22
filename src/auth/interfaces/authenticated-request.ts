import type { Request } from 'express';
import type { SessionContainerInterface } from 'supertokens-node/recipe/session/types';
import { Role } from '../roles/role.enum';

export type AuthenticatedUser = {
  superTokensUserId: string;
  participantId?: number;
  email?: string;
  role: Role;
};

export type AuthenticatedRequest = Request & {
  session?: SessionContainerInterface;
  auth?: AuthenticatedUser;
};
