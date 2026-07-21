import { z } from 'zod';

const safePublicUrl = z.string().max(1_000).refine((value) => {
  if (value === '') return true;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}, 'Expected an HTTPS URL.');

export const storedPassportSchema = z.object({
  uid: z.string().min(1).max(128),
  name: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(100),
  location: z.string().trim().max(100),
  experience: z.string().trim().max(100),
  bio: z.string().trim().max(2_000),
  avatarUrl: safePublicUrl,
  projects: z.array(z.object({
    id: z.number().int().nonnegative(),
    title: z.string().trim().min(1).max(100),
    img: safePublicUrl.refine((value) => value !== '', 'Project image is required.'),
  }).strict()).max(6),
  updatedAt: z.unknown().optional(),
}).strict();

export type StoredPassport = z.infer<typeof storedPassportSchema>;

export function isSafePublicUrl(value: string) {
  return safePublicUrl.safeParse(value).success;
}
