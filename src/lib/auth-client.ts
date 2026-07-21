import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import type { Cre8tivAuth } from '../server/auth';

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<Cre8tivAuth>()],
});

export type ClientSession = typeof authClient.$Infer.Session;
