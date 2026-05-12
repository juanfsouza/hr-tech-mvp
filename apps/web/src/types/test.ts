export interface TestSessionResponse {
  token: string;
  portalUrl: string;
  expiresAt: string;
}

export interface TestSessionInput {
  candidateId: string;
  expiryHours?: number;
}

export interface TestProgressInput {
  testType: string;
  questionId: string;
  answer: string;
}

export type TestResponses = Record<string, string>;

export interface TestSession {
  id: string;
  candidateId: string;
  collaboratorId?: string; // Some legacy code uses collaboratorId
  token: string;
  expiresAt: string;
  isCompleted: boolean;
  testType?: string;
  createdAt: string;
}
