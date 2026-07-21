import { z } from 'zod';

const cleanText = (minimum: number, maximum: number) => z.string().trim().min(minimum).max(maximum);
const optionalSalary = z.number().int().min(0).max(2_000_000).nullable().optional();

const publicUrl = z.string().trim().url().max(500).refine((value) => {
  const url = new URL(value);
  return url.protocol === 'https:' || (url.protocol === 'http:' && url.hostname === 'localhost');
}, 'Portfolio URLs must use HTTPS.');

export const passportInputSchema = z.object({
  slug: z.string().trim().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  headline: cleanText(3, 140),
  location: cleanText(2, 100),
  biography: cleanText(20, 2_000),
  skills: z.array(cleanText(1, 50)).min(1).max(20).transform((items) => [...new Set(items)]),
  portfolioLinks: z.array(z.object({
    label: cleanText(1, 60),
    url: publicUrl,
  }).strict()).max(8),
  availability: cleanText(2, 120),
}).strict();

export const jobInputSchema = z.object({
  title: cleanText(3, 140),
  company: cleanText(2, 140),
  location: cleanText(2, 120),
  workArrangement: z.enum(['on_site', 'hybrid', 'remote']),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'casual']),
  salaryMin: optionalSalary,
  salaryMax: optionalSalary,
  salaryText: z.string().trim().max(120).nullable().optional(),
  description: cleanText(80, 10_000),
  applicationDetails: cleanText(20, 2_000),
}).strict().superRefine((value, context) => {
  if (value.salaryMin != null && value.salaryMax != null && value.salaryMin > value.salaryMax) {
    context.addIssue({ code: 'custom', message: 'Minimum salary cannot exceed maximum salary.', path: ['salaryMin'] });
  }
});

export const applicationInputSchema = z.object({
  note: z.string().trim().max(1_500).nullable().optional(),
}).strict();

export const reviewInputSchema = z.object({
  action: z.enum(['approve', 'reject', 'publish']),
  notes: z.string().trim().max(2_000).nullable().optional(),
}).strict();

export const applicationStatusInputSchema = z.object({
  status: z.enum(['reviewing', 'shortlisted', 'declined']),
}).strict();
