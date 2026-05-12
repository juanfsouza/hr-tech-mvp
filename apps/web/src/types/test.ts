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
