export type UserRole = 'candidate' | 'employer' | 'admin';
export type JobStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected' | 'expired';

export type Job = {
  id: string;
  employerId: string;
  title: string;
  company: string;
  location: string;
  workArrangement: 'on_site' | 'hybrid' | 'remote';
  employmentType: 'full_time' | 'part_time' | 'contract' | 'casual';
  salaryMin: number | null;
  salaryMax: number | null;
  salaryText: string | null;
  description: string;
  applicationDetails: string;
  listingType: 'exclusive';
  priceCents: 3000;
  status: JobStatus;
  reviewNotes: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationStatus = 'watchlist' | 'applied' | 'interviewing' | 'offer' | 'archived';

export type Application = {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  notes: string;
  addedAt: number;
};

export type Theme = 'neo' | 'cottagecore' | 'lame';

export type Passport = {
  id: string;
  slug: string;
  headline: string;
  location: string;
  biography: string;
  skills: string[];
  portfolioLinks: { label: string; url: string }[];
  availability: string;
  displayName?: string;
};

export type SavedSearch = {
  id: string;
  name: string;
  query: string;
  city: string;
  type: string;
  tag: string;
  timestamp: number;
};
