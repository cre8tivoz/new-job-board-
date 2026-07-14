export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  tags: string[];
  postedAt: string;
  exclusive?: boolean;
  description: string;
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

export type SavedSearch = {
  id: string;
  name: string;
  query: string;
  city: string;
  type: string;
  tag: string;
  timestamp: number;
};
