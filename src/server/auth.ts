import type { Request } from 'express';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { fromNodeHeaders } from 'better-auth/node';
import type { Database } from './db/client.js';
import { schema } from './db/schema.js';
import { deploymentOrigin, trustedApplicationOrigins } from './origin.js';

export const publicRoles = ['candidate', 'employer'] as const;
export type PublicRole = typeof publicRoles[number];

export function isPublicRole(value: unknown): value is PublicRole {
  return typeof value === 'string' && publicRoles.includes(value as PublicRole);
}

export function createAuth(database: Database) {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error('Authentication is not configured.');
  }

  const localOrigin = 'http://localhost:3000';
  const baseURL = process.env.BETTER_AUTH_URL?.trim() || deploymentOrigin() || localOrigin;

  return betterAuth({
    appName: 'Cre8tiv',
    baseURL,
    secret,
    trustedOrigins: trustedApplicationOrigins(localOrigin),
    database: drizzleAdapter(database, { provider: 'pg', schema }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    user: {
      additionalFields: {
        role: {
          type: ['candidate', 'employer', 'admin'],
          required: true,
          defaultValue: 'candidate',
          input: false,
        },
        accountType: {
          type: ['candidate', 'employer'],
          required: true,
          defaultValue: 'candidate',
          input: true,
          returned: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (newUser) => {
            const accountType = isPublicRole(newUser.accountType) ? newUser.accountType : 'candidate';
            return { data: { ...newUser, accountType, role: accountType } };
          },
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: false },
    },
    advanced: {
      cookiePrefix: 'cre8tiv',
      useSecureCookies: process.env.NODE_ENV === 'production',
    },
    rateLimit: {
      enabled: process.env.NODE_ENV !== 'test',
      window: 60,
      max: 30,
    },
  });
}

export type Cre8tivAuth = ReturnType<typeof createAuth>;
export type AuthSession = Awaited<ReturnType<Cre8tivAuth['api']['getSession']>>;

export async function readSession(auth: Cre8tivAuth, req: Request) {
  return auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
}
