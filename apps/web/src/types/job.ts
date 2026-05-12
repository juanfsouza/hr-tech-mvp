export interface CreateJobInput {
  title: string;
  description?: string;
  department?: string;
  location?: string;
  type?: string;
  requirements?: string[];
  responsibilities?: string[];
  responsibleId?: string;
}

export interface Job {
  candidatesCount?: number;
  id: string;
  title: string;
  status: string;
  description?: string;
  companyId: string;
  location?: string;
  createdAt: string;
}

export interface JobListResponse {
  items: Job[];
  nextCursor?: string;
  hasNextPage?: boolean;
}

