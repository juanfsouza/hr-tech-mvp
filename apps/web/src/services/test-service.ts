import { api } from '@/lib/api';

export type TestType = 'DISC' | 'ENNEAGRAM' | 'SIXTEEN_PERSONALITIES';

export interface TestSession {
  sessionId: string;
  status: string;
  currentTest?: TestType;
  expiresAt: string;
  responses?: Record<string, string>;
}

export interface SaveProgressInput {
  testType: TestType;
  questionId: string;
  answer: string;
}

export const testService = {
  async getSession(token: string) {
    const { data } = await api.get<TestSession>(`/tests/portal/${token}`);
    return data;
  },

  async getQuestions(type: TestType) {
    const { data } = await api.get<any>(`/tests/questions/${type}`);
    return data;
  },

  async saveProgress(token: string, input: SaveProgressInput) {
    const { data } = await api.patch<{ saved: boolean }>(`/tests/portal/${token}/progress`, input);
    return data;
  },

  async completeTest(token: string, testType: TestType) {
    const { data } = await api.post<{ allCompleted: boolean; nextTest?: TestType; profileId?: string }>(
      `/tests/portal/${token}/complete`, 
      { testType }
    );
    return data;
  }
};
