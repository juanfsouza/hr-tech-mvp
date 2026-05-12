export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  matchScore?: number;
  matchId?: string;
  status: string;
  jobId?: string;
}

export interface CreateCandidateInput {
  name: string;
  email: string;
  phone?: string;
  jobId?: string;
}
export interface CandidateListResponse {
  items: Candidate[];
  nextCursor?: string;
  hasNextPage?: boolean;
}
