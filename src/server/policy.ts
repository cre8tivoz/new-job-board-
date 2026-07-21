import type { JobStatus, UserRole } from './db/schema.js';

export class AccessDeniedError extends Error {
  readonly statusCode: number;

  constructor(message = 'You do not have permission to perform this action.', statusCode = 403) {
    super(message);
    this.name = 'AccessDeniedError';
    this.statusCode = statusCode;
  }
}

export function requireRole(actual: UserRole, ...allowed: UserRole[]) {
  if (!allowed.includes(actual)) throw new AccessDeniedError();
}

export function requireOwner(actualOwnerId: string, sessionUserId: string) {
  if (actualOwnerId !== sessionUserId) throw new AccessDeniedError();
}

const allowedTransitions: Record<JobStatus, readonly JobStatus[]> = {
  draft: ['pending_review'],
  pending_review: ['approved', 'rejected'],
  approved: ['published'],
  published: ['expired'],
  rejected: [],
  expired: [],
};

export function assertJobTransition(from: JobStatus, to: JobStatus) {
  if (!allowedTransitions[from].includes(to)) {
    throw new AccessDeniedError('That listing lifecycle transition is not allowed.', 409);
  }
}
