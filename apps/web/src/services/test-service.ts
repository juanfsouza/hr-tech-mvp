import { api } from "@/lib/api";
import { TestSessionResponse, TestSessionInput, TestProgressInput } from "@/types/test";

export const testService = {
  async createSession(input: TestSessionInput) {
    const { data } = await api.post<TestSessionResponse>("/tests/sessions", input);
    return data;
  },

  async listSessions() {
    const { data } = await api.get("/tests/sessions");
    return data;
  },

  async getSession(token: string) {
    const { data } = await api.get(`/tests/portal/${token}`);
    return data;
  },

  async getQuestions(testType: string) {
    const { data } = await api.get(`/tests/questions/${testType}`);
    return data;
  },

  async saveProgress(token: string, input: { testType: string; questionId: string; answer: string }) {
    const { data } = await api.post(`/tests/portal/${token}/progress`, input);
    return data;
  },

  async completeTest(token: string, testType: string) {
    const { data } = await api.post(`/tests/portal/${token}/complete`, { testType });
    return data;
  }
};

export type { TestSessionResponse, TestSessionInput, TestProgressInput };
